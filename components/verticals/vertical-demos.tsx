"use client";

import { useState } from "react";
import { Reveal } from "@/components/ui/reveal";
import { Phone } from "./vertical-proof";
import type { VerticalDemo } from "@/sanity/types";

/**
 * Esempi finti (`vetrina/`), non lavori veri: `vertical-proof.tsx` risponde a
 * "l'ha fatto davvero", questo a "com'è per il mio tipo di locale" —
 * `docs/ideas/vetrina-demo-per-tipologia.md` §10.4. Stesso `Phone` della
 * prova vera, riusato invece che duplicato: un chip alla volta, un solo
 * telefono grande che cambia — mai tre mockup affiancati (vedi il commento in
 * cima a `vertical-proof.tsx` sul perché).
 *
 * Il disclaimer è testo fisso, uguale su ogni landing: non sta su Sanity
 * perché non deve poter divergere per nicchia, ed è l'unica riga — non un
 * badge ripetuto su ogni chip, che dopo la seconda ripetizione smette di
 * essere letto.
 */
const DISCLAIMER =
  "Esempi di attività inventate — non sono clienti reali, servono a far vedere com'è per il tuo mestiere.";

export function VerticalDemos({ demos }: { demos: VerticalDemo[] }) {
  const [activeId, setActiveId] = useState(demos[0]?.id);

  if (demos.length === 0) return null;

  const active = demos.find((demo) => demo.id === activeId) ?? demos[0];

  return (
    <div className="flex flex-col items-center gap-8">
      <p className="max-w-xl text-center text-sm text-foreground-muted">{DISCLAIMER}</p>

      <div className="flex w-full gap-2 overflow-x-auto px-1 pb-2 sm:flex-wrap sm:justify-center sm:overflow-visible">
        {demos.map((demo) => (
          <button
            key={demo.id}
            type="button"
            onClick={() => setActiveId(demo.id)}
            aria-pressed={demo.id === active.id}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              demo.id === active.id
                ? "border-foreground bg-foreground text-background"
                : "border-foreground/20 text-foreground-muted hover:border-foreground/40"
            }`}
          >
            {demo.varianteLabel ?? demo.name}
          </button>
        ))}
      </div>

      {/* `key` forza un nuovo `Reveal` al cambio demo: senza, l'animazione di
          ingresso parte solo la prima volta, e il cambio chip sembra un
          semplice cambio immagine invece che un nuovo esempio. */}
      <Reveal key={active.id} className="shrink-0">
        <Phone
          screenshot={{
            image: active.screenshot,
            clientName: null,
            consentGiven: false,
            href: active.url,
          }}
          caption={active.pitchLine ?? active.name}
          size='small'
        />
      </Reveal>
    </div>
  );
}
