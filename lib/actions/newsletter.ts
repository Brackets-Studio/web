"use server";

import { z } from "zod";

const newsletterSchema = z.object({
  email: z.email().max(200),
});

export type NewsletterFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function subscribeToNewsletter(
  _prevState: NewsletterFormState,
  formData: FormData,
): Promise<NewsletterFormState> {
  const parsed = newsletterSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { status: "error", message: "invalidEmail" };
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_NEWSLETTER_LIST_ID;

  if (!apiKey || !listId) {
    console.error("BREVO_API_KEY o BREVO_NEWSLETTER_LIST_ID non configurate.");
    return { status: "error", message: "notConfigured" };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: parsed.data.email,
        listIds: [Number(listId)],
        updateEnabled: true,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("Errore iscrizione newsletter Brevo:", response.status, body);
      return { status: "error", message: "generic" };
    }

    return { status: "success" };
  } catch (error) {
    console.error("Errore iscrizione newsletter Brevo:", error);
    return { status: "error", message: "generic" };
  }
}
