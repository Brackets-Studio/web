import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { head, put, BlobNotFoundError } from "@vercel/blob";

// Collector for the "did the lead open the demo" beacon. Every demo built
// from white-repo forwards its hits here (see its app/api/hit/route.ts).
// This is the only piece that writes anything and sends a Telegram
// notification — the demo project itself never talks to Blob or Telegram
// directly, only to this route.
export const dynamic = "force-dynamic";

const SLUG_TOKEN_PATTERN = /^[a-z0-9][a-z0-9.-]{0,40}$/;
const KINDS = new Set(["open", "human"]);
const DEVICES = new Set(["mobile", "desktop"]);

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // Buffers of different length would make timingSafeEqual throw; a length
  // mismatch already means "not equal" so short-circuiting here is fine —
  // it leaks only the length of the secret, not its content.
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function isValidBody(value: unknown): value is {
  slug: string;
  token: string;
  kind: "open" | "human";
  device: "mobile" | "desktop";
  dev: boolean;
} {
  if (typeof value !== "object" || value === null) return false;
  const { slug, token, kind, device, dev } = value as Record<string, unknown>;
  return (
    typeof slug === "string" &&
    SLUG_TOKEN_PATTERN.test(slug) &&
    typeof token === "string" &&
    SLUG_TOKEN_PATTERN.test(token) &&
    typeof kind === "string" &&
    KINDS.has(kind) &&
    typeof device === "string" &&
    DEVICES.has(device) &&
    typeof dev === "boolean"
  );
}

function isoDateUTC(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// "13/09 18:42" in Europe/Rome — the notification is for a person deciding
// whether to follow up today, so it has to read in local wall-clock time.
function formatRomeTime(date: Date): string {
  const parts = new Intl.DateTimeFormat("it-IT", {
    timeZone: "Europe/Rome",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("day")}/${get("month")} ${get("hour")}:${get("minute")}`;
}

async function notifyTelegram(text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    console.warn("TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID non impostate: nessuna notifica beacon inviata.");
    return;
  }
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
      signal: AbortSignal.timeout(2500),
    });
  } catch (error) {
    // A Telegram outage must never fail the write or the response to the
    // demo that sent us this hit.
    console.error("Errore invio notifica Telegram beacon:", error);
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.BEACON_SECRET;
  if (!secret) {
    return new NextResponse(null, { status: 503 });
  }

  const provided = request.headers.get("x-beacon-secret") ?? "";
  if (!safeEqual(provided, secret)) {
    return new NextResponse(null, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  if (!isValidBody(payload)) {
    return new NextResponse(null, { status: 400 });
  }

  const { slug, token, kind, device, dev } = payload;

  // Server timestamp, never the client's: phone clocks aren't trustworthy.
  const now = new Date();
  const ts = now.toISOString();
  const day = isoDateUTC(now); // UTC, so the path never depends on the reader's timezone.
  const filename = dev ? `${kind}-dev.json` : `${kind}.json`;
  const path = `hits/${slug}/${token}/${day}/${filename}`;

  let isDuplicate = false;
  try {
    await head(path);
    isDuplicate = true;
  } catch (error) {
    if (!(error instanceof BlobNotFoundError)) {
      // Blob is unreachable for some other reason: don't write a possibly
      // duplicate hit, and don't notify on data we couldn't verify.
      console.error("Errore head() beacon su Blob:", error);
      return new NextResponse(null, { status: 204 });
    }
  }

  if (!isDuplicate) {
    const body = JSON.stringify({ slug, token, kind, ts, device, dev });
    try {
      await put(path, body, {
        addRandomSuffix: false,
        allowOverwrite: false,
        contentType: "application/json",
        // No "private" bucket in older SDK versions existed; this installed
        // version does expose 'private', so we use it — the JSON blobs are
        // reachable only with a signed URL, never guessable from the demo's
        // own domain.
        access: "private",
      });
    } catch (error) {
      // Most likely a race: another request wrote the same path between our
      // head() and this put(). Treat it exactly like a duplicate.
      console.warn("put() beacon in race con una scrittura concorrente, trattato come duplicato:", error);
      isDuplicate = true;
    }
  }

  if (!isDuplicate) {
    const prefix = dev ? "🧪 TEST" : "🔔";
    const text = `${prefix} ${slug} · ${token} · ${kind} · ${device}\n${formatRomeTime(now)}`;
    await notifyTelegram(text);
  }

  return new NextResponse(null, { status: 204 });
}
