import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/reveal";
import { urlFor } from "@/sanity/image";
import type { VerticalDemo } from "@/sanity/types";

/**
 * Esempi finti (`vetrina/`), non lavori veri: `vertical-proof.tsx` risponde a
 * "l'ha fatto davvero", questo a "com'è per il mio tipo di locale" —
 * `docs/ideas/vetrina-demo-per-tipologia.md` §10.4. Galleria orizzontale
 * scorribile, tutte visibili insieme — niente selettore: con un solo
 * telefono grande alla volta le demo successive restavano invisibili senza
 * un controllo esplicito per raggiungerle. Screenshot da desktop, non da
 * telefono: la demo si guarda com'è, non incorniciata.
 *
 * Il disclaimer è testo fisso, uguale su ogni landing: non sta su Sanity
 * perché non deve poter divergere per nicchia.
 */
const DISCLAIMER =
  "Esempi di attività inventate — non sono clienti reali, servono a far vedere com'è per il tuo mestiere.";

export function VerticalDemos({ demos }: { demos: VerticalDemo[] }) {
  if (demos.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-8">
      <p className="max-w-xl text-center text-sm text-foreground-muted">{DISCLAIMER}</p>

      <div className="flex w-full snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 sm:justify-center sm:px-1">
        {demos.map((demo, index) => (
          <Reveal key={demo.id} className="shrink-0 snap-start">
            <DemoCard demo={demo} priority={index === 0} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function DemoCard({ demo, priority }: { demo: VerticalDemo; priority?: boolean }) {
  const caption = demo.pitchLine ?? demo.name;

  const body = (
    <figure className="w-72 sm:w-96">
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-background-elevated shadow-xl">
        <Image
          src={urlFor(demo.screenshot).width(960).url()}
          alt={caption}
          fill
          sizes="(min-width: 640px) 384px, 288px"
          priority={priority}
          className="object-cover object-top"
        />
      </div>
      <figcaption className="mt-4 flex items-center justify-center gap-1 text-center text-sm text-foreground-muted">
        {caption}
        {demo.url && <ArrowUpRight className="size-3.5" aria-hidden />}
      </figcaption>
    </figure>
  );

  return demo.url ? (
    <Link
      href={demo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block transition-transform hover:-translate-y-1"
    >
      {body}
    </Link>
  ) : (
    body
  );
}
