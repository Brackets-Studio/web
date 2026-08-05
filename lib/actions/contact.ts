"use server";

import { z } from "zod";
import { siteConfig } from "@/lib/site";

const PROJECT_TYPES = ["web", "mobile", "ai", "other"] as const;

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(200),
  projectType: z.enum(PROJECT_TYPES).optional(),
  message: z.string().trim().min(10).max(4000),
  // Honeypot: real users never fill this, bots often do.
  company: z.string().max(0).optional().or(z.literal("")),
});

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "message", string>>;
};

const PROJECT_TYPE_LABEL: Record<(typeof PROJECT_TYPES)[number], string> = {
  web: "Sito o software su misura",
  mobile: "App per cellulare",
  ai: "Intelligenza artificiale e automazione",
  other: "Altro / non lo so ancora",
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    projectType: formData.get("projectType") || undefined,
    message: formData.get("message"),
    company: formData.get("company") ?? "",
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    return {
      status: "error",
      message: "Controlla i campi evidenziati e riprova.",
      fieldErrors: {
        name: flat.name?.[0],
        email: flat.email?.[0],
        message: flat.message?.[0],
      },
    };
  }

  // Honeypot tripped: pretend success, drop silently.
  if (parsed.data.company) {
    return { status: "success" };
  }

  const { name, email, projectType, message } = parsed.data;
  const apiKey = process.env.BREVO_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL || siteConfig.email;

  if (!apiKey) {
    console.error("BREVO_API_KEY non configurata: impossibile inviare il messaggio di contatto.");
    return {
      status: "error",
      message: "Il modulo non è configurato correttamente. Scrivici direttamente a " + siteConfig.email + ".",
    };
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
        replyTo: { email, name },
        subject: `Nuovo contatto dal sito — ${name}`,
        htmlContent: `
          <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          ${projectType ? `<p><strong>Tipo di progetto:</strong> ${escapeHtml(PROJECT_TYPE_LABEL[projectType])}</p>` : ""}
          <p><strong>Messaggio:</strong></p>
          <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
        `,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("Errore invio email Brevo:", response.status, body);
      return {
        status: "error",
        message: "Non siamo riusciti a inviare il messaggio. Riprova tra poco o scrivici a " + siteConfig.email + ".",
      };
    }

    return { status: "success" };
  } catch (error) {
    console.error("Errore invio email Brevo:", error);
    return {
      status: "error",
      message: "Non siamo riusciti a inviare il messaggio. Riprova tra poco o scrivici a " + siteConfig.email + ".",
    };
  }
}
