"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import { track } from "@vercel/analytics";
import { requestCallback, type CallbackFormState } from "@/lib/actions/callback";

/**
 * "Ti richiamo io" — due campi.
 *
 * Esiste per una fetta di visitatori che le CTA telefono/WhatsApp non prendono:
 * chi sta guardando la pagina in un momento in cui non può parlare. Senza
 * questo, quelle persone non hanno alcun modo di lasciare un contatto.
 *
 * Due campi e basta, di proposito. Ogni campo in più (email, "raccontaci il tuo
 * progetto") è gente che chiude la pagina — e un nome e un numero sono già tutto
 * quello che serve per richiamare.
 */

const initialState: CallbackFormState = { status: "idle" };

const inputClass =
  "v-input w-full border border-border bg-background-elevated px-3.5 py-3 text-base text-foreground placeholder:text-foreground-muted outline-none transition-colors focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/20 aria-invalid:border-destructive";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="v-btn v-btn--primary disabled:pointer-events-none disabled:opacity-60"
    >
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {pending ? "Invio…" : "Richiamami"}
    </button>
  );
}

export function CallbackForm({
  vertical,
  title,
  text,
}: {
  vertical: string;
  title: string;
  text: string | null;
}) {
  const [state, formAction] = useActionState(requestCallback, initialState);

  useEffect(() => {
    if (state.status === "success") {
      track("vertical_callback_submit", { vertical });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  if (state.status === "success") {
    return (
      <div role="status" className="v-card v-card--tint flex items-start gap-3 p-6">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
        <div>
          <p className="font-medium text-foreground">Ricevuto.</p>
          <p className="mt-1 text-sm text-foreground-muted">
            Ti chiamo io, di solito entro poche ore.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="v-card p-6">
      <h3 className="v-title text-xl text-foreground">{title}</h3>
      {text && <p className="mt-2 text-sm text-foreground-muted">{text}</p>}

      <input type="hidden" name="vertical" value={vertical} />
      {/* Honeypot — nascosto agli utenti, non ai bot. */}
      <div aria-hidden className="absolute left-[-9999px]">
        <label htmlFor="cb-company">Azienda</label>
        <input id="cb-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="cb-name" className="sr-only">
            Il tuo nome
          </label>
          <input
            id="cb-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Il tuo nome"
            aria-invalid={state.fieldErrors?.name ? true : undefined}
            aria-describedby={state.fieldErrors?.name ? "cb-name-error" : undefined}
            className={inputClass}
          />
          {state.fieldErrors?.name && (
            <p id="cb-name-error" className="mt-1.5 text-xs text-destructive">
              {state.fieldErrors.name}
            </p>
          )}
        </div>

        <div className="flex-1">
          <label htmlFor="cb-phone" className="sr-only">
            Il tuo numero
          </label>
          <input
            id="cb-phone"
            name="phone"
            // `tel` apre il tastierino numerico sul telefono, dove arriva quasi
            // tutto questo traffico.
            type="tel"
            required
            autoComplete="tel"
            placeholder="Il tuo numero"
            aria-invalid={state.fieldErrors?.phone ? true : undefined}
            aria-describedby={state.fieldErrors?.phone ? "cb-phone-error" : undefined}
            className={inputClass}
          />
          {state.fieldErrors?.phone && (
            <p id="cb-phone-error" className="mt-1.5 text-xs text-destructive">
              {state.fieldErrors.phone}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <SubmitButton />
        <p className="text-xs text-foreground-muted">
          Nessuna newsletter, nessun preventivo automatico.
        </p>
      </div>

      {state.status === "error" && state.message && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {state.message}
        </p>
      )}
    </form>
  );
}
