"use server";

import { z } from "zod";
import { siteConfig } from "@/lib/site";

/**
 * Richiesta di richiamata dalle landing verticali.
 *
 * Non riusa `submitContactForm`: quello pretende email e un messaggio di almeno
 * dieci caratteri, che su una landing verticale sono esattamente gli attriti da
 * togliere. Qui i campi sono due — nome e telefono — perché chi non ha voglia di
 * chiamare non ha nemmeno voglia di scrivere un messaggio. Struttura e difese
 * restano però le stesse di `lib/actions/contact.ts` (zod, honeypot, Brevo,
 * escape dell'HTML): se cambia il canale d'invio, cambia in entrambi.
 */

/** Numeri italiani, con o senza prefisso, con spazi/punti/trattini a piacere. */
const PHONE_RE = /^(\+?39)?[\s.-]?3\d{2}[\s.-]?\d{6,7}$/;

const callbackSchema = z.object({
  name: z.string().trim().min(2, "Serve il tuo nome.").max(120),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine((value) => PHONE_RE.test(value.replace(/\s/g, "")), {
      message: "Controlla il numero: serve un cellulare italiano.",
    }),
  /** Slug della verticale da cui arriva il contatto — non è input dell'utente. */
  vertical: z.string().trim().max(96).optional(),
  // Honeypot: gli utenti veri non lo compilano mai, i bot spesso sì.
  company: z.string().max(0).optional().or(z.literal("")),
});

export type CallbackFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "phone", string>>;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function requestCallback(
  _prevState: CallbackFormState,
  formData: FormData,
): Promise<CallbackFormState> {
  const parsed = callbackSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    vertical: formData.get("vertical") || undefined,
    company: formData.get("company") ?? "",
  });

  if (!parsed.success) {
    const flat = z.flattenError(parsed.error).fieldErrors;
    return {
      status: "error",
      message: "Controlla i campi evidenziati e riprova.",
      fieldErrors: { name: flat.name?.[0], phone: flat.phone?.[0] },
    };
  }

  // Honeypot scattato: si finge il successo e si butta via tutto.
  if (parsed.data.company) {
    return { status: "success" };
  }

  const { name, phone, vertical } = parsed.data;
  const apiKey = process.env.BREVO_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL || siteConfig.email;

  const fallback = `Il modulo non funziona. Chiamami direttamente allo ${siteConfig.phone}.`;

  if (!apiKey) {
    console.error("BREVO_API_KEY non configurata: impossibile inviare la richiesta di richiamata.");
    return { status: "error", message: fallback };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: siteConfig.name, email: siteConfig.email },
        to: [{ email: toEmail, name: siteConfig.name }],
        // La verticale finisce nell'oggetto: è l'unico modo, oggi, di sapere
        // quale landing ha portato il contatto.
        subject: `Richiamata richiesta${vertical ? ` — ${vertical}` : ""} — ${name}`,
        htmlContent: `
          <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
          <p><strong>Telefono:</strong> <a href="tel:${escapeHtml(phone.replace(/\s/g, ""))}">${escapeHtml(phone)}</a></p>
          ${vertical ? `<p><strong>Landing:</strong> /it/${escapeHtml(vertical)}</p>` : ""}
        `,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("Errore invio email Brevo (richiamata):", response.status, body);
      return { status: "error", message: fallback };
    }

    return { status: "success" };
  } catch (error) {
    console.error("Errore invio email Brevo (richiamata):", error);
    return { status: "error", message: fallback };
  }
}
