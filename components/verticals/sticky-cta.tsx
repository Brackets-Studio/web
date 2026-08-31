"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Phone } from "lucide-react";

/**
 * La barra CTA fissa in fondo, solo su mobile.
 *
 * Il traffico di queste landing arriva da ricerca locale, quasi sempre da
 * telefono, e da qualcuno che sta facendo altro. Chiedergli di scorrere fino in
 * fondo per trovare un numero è il modo più semplice di perderlo: la barra
 * garantisce che "chiama" sia sempre a un pollice di distanza.
 *
 * Compare solo dopo che l'hero è uscito dallo schermo — sopra la piega le due
 * CTA ci sono già, e sovrapporgliene una terza coprirebbe la foto senza
 * aggiungere niente. Su desktop non compare mai: lì la pagina si vede intera e
 * una barra fissa è solo ingombro.
 */
export function StickyCta({
  telHref,
  whatsappHref,
  callLabel,
  whatsappLabel,
  /** id dell'elemento hero: finché è visibile, la barra resta nascosta. */
  watchId,
}: {
  telHref: string;
  whatsappHref: string;
  callLabel: string;
  whatsappLabel: string;
  watchId: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Se l'hero non c'è la barra resta nascosta, e va bene così: una CTA che
    // manca costa meno di una barra fissa che copre i contenuti per sempre.
    const hero = document.getElementById(watchId);
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { rootMargin: "-64px 0px 0px 0px" },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [watchId]);

  return (
    <div
      // `hidden` invece di smontare: l'elemento resta nel DOM e la transizione
      // può animare. `pointer-events-none` da nascosto evita che intercetti tap
      // sui contenuti sotto durante la dissolvenza.
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background-elevated/95 backdrop-blur-sm transition-[opacity,transform] duration-300 sm:hidden ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-full opacity-0"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-hidden={!visible}
    >
      <div className="flex gap-2 p-3">
        <a
          href={telHref}
          tabIndex={visible ? undefined : -1}
          className="v-btn v-btn--primary flex-1"
        >
          <Phone className="size-4" aria-hidden />
          {callLabel}
        </a>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={visible ? undefined : -1}
          aria-label={whatsappLabel}
          className="v-btn v-btn--ghost"
        >
          <MessageCircle className="size-5" aria-hidden />
        </a>
      </div>
    </div>
  );
}
