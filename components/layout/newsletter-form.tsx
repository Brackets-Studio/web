"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { Loader2, ArrowRight, Check } from "lucide-react";
import { subscribeToNewsletter, type NewsletterFormState } from "@/lib/actions/newsletter";

const initialState: NewsletterFormState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label="Iscriviti"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand text-brand-foreground transition-transform hover:scale-[1.05] active:scale-[0.95] disabled:pointer-events-none disabled:opacity-60"
    >
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <ArrowRight className="size-4" aria-hidden />}
    </button>
  );
}

export function NewsletterForm() {
  const t = useTranslations("newsletter");
  const [state, formAction] = useActionState(subscribeToNewsletter, initialState);

  if (state.status === "success") {
    return (
      <p className="flex items-center gap-2 text-sm text-foreground">
        <Check className="size-4 text-brand" aria-hidden />
        {t("success")}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 pr-1.5 py-1.5 focus-within:border-brand">
        <input
          type="email"
          name="email"
          required
          placeholder={t("placeholder")}
          className="w-full min-w-0 bg-transparent text-sm text-foreground placeholder:text-foreground-muted outline-none"
        />
        <SubmitButton />
      </div>
      {state.status === "error" && (
        <p role="alert" className="text-xs text-destructive">
          {t("error")}
        </p>
      )}
    </form>
  );
}
