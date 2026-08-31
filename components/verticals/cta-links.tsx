"use client";

import { Phone, MessageCircle } from "lucide-react";
import { track } from "@vercel/analytics";

/**
 * Le due CTA telefono/WhatsApp della landing, isolate in un client component
 * solo per poter tracciare il click — `page.tsx` resta un Server Component.
 */
export function VerticalCtaLinks({
  vertical,
  tel,
  whatsapp,
  callLabel,
  whatsappLabel,
}: {
  vertical: string;
  tel: string;
  whatsapp: string;
  callLabel: string;
  whatsappLabel: string;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={tel}
        className="v-btn v-btn--primary"
        onClick={() => track("vertical_cta_click", { vertical, type: "phone" })}
      >
        <Phone className="size-4" aria-hidden />
        {callLabel}
      </a>
      <a
        href={whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="v-btn v-btn--ghost"
        onClick={() => track("vertical_cta_click", { vertical, type: "whatsapp" })}
      >
        <MessageCircle className="size-4" aria-hidden />
        {whatsappLabel}
      </a>
    </div>
  );
}
