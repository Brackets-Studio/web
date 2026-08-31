"use server";

import { z } from "zod";
import { siteConfig } from "@/lib/site";

/**
 * Invio del preventivatore interattivo. Stessa difesa di
 * `lib/actions/contact.ts`/`callback.ts` (zod, honeypot, Brevo,
 * escape dell'HTML) — se cambia il canale d'invio, cambia in tutti e tre.
 *
 * A differenza del form di contatto, "contact" accetta email O telefono in un
 * solo campo: chi ha appena passato quattro passaggi di un calcolatore non
 * deve scegliere tra due campi, ne basta uno.
 */

const quoteSchema = z.object({
  name: z.string().trim().min(2, "Serve il tuo nome.").max(120),
  contact: z.string().trim().min(3, "Serve un'email o un numero di telefono.").max(200),
  message: z.string().trim().max(4000).optional().or(z.literal("")),
  // Riepilogo calcolato dal calcolatore — non è input libero dell'utente.
  serviceName: z.string().trim().max(200).optional(),
  answersSummary: z.string().trim().max(2000).optional(),
  priceRange: z.string().trim().max(200).optional(),
  timeline: z.string().trim().max(200).optional(),
  // Honeypot: gli utenti veri non lo compilano mai, i bot spesso sì.
  company: z.string().max(0).optional().or(z.literal("")),
});

export type QuoteFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "contact", string>>;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function submitQuoteForm(
  _prevState: QuoteFormState,
  formData: FormData,
): Promise<QuoteFormState> {
  const parsed = quoteSchema.safeParse({
    name: formData.get("name"),
    contact: formData.get("contact"),
    message: formData.get("message") || undefined,
    serviceName: formData.get("serviceName") || undefined,
    answersSummary: formData.get("answersSummary") || undefined,
    priceRange: formData.get("priceRange") || undefined,
    timeline: formData.get("timeline") || undefined,
    company: formData.get("company") ?? "",
  });

  if (!parsed.success) {
    const flat = z.flattenError(parsed.error).fieldErrors;
    return {
      status: "error",
      message: "Controlla i campi evidenziati e riprova.",
      fieldErrors: { name: flat.name?.[0], contact: flat.contact?.[0] },
    };
  }

  // Honeypot scattato: si finge il successo e si butta via tutto.
  if (parsed.data.company) {
    return { status: "success" };
  }

  const { name, contact, message, serviceName, answersSummary, priceRange, timeline } = parsed.data;
  const apiKey = process.env.BREVO_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL || siteConfig.email;

  const fallback = `Non siamo riusciti a inviare la richiesta. Scrivici direttamente a ${siteConfig.email}.`;

  if (!apiKey) {
    console.error("BREVO_API_KEY non configurata: impossibile inviare il preventivo.");
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
        subject: `Preventivo dal sito${serviceName ? ` — ${serviceName}` : ""} — ${name}`,
        htmlContent: `
          <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
          <p><strong>Contatto:</strong> ${escapeHtml(contact)}</p>
          ${serviceName ? `<p><strong>Servizio:</strong> ${escapeHtml(serviceName)}</p>` : ""}
          ${answersSummary ? `<p><strong>Risposte:</strong> ${escapeHtml(answersSummary)}</p>` : ""}
          ${priceRange ? `<p><strong>Fascia stimata:</strong> ${escapeHtml(priceRange)}</p>` : ""}
          ${timeline ? `<p><strong>Tempistica stimata:</strong> ${escapeHtml(timeline)}</p>` : ""}
          ${message ? `<p><strong>Messaggio:</strong></p><p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>` : ""}
        `,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("Errore invio email Brevo (preventivo):", response.status, body);
      return { status: "error", message: fallback };
    }

    return { status: "success" };
  } catch (error) {
    console.error("Errore invio email Brevo (preventivo):", error);
    return { status: "error", message: fallback };
  }
}
