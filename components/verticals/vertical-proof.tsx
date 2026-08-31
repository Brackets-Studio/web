import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BatteryFull, Signal, Wifi } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { urlFor } from "@/sanity/image";
import type { VerticalScreenshot } from "@/sanity/types";

/**
 * La prova: un telefono grande, non tre in fila.
 *
 * Prima erano tre mockup affiancati e piccoli. Due problemi: un ristoratore non
 * "legge" uno screenshot di un sito rimpicciolito a 200px — vede tre rettangoli
 * colorati — e comunque tre lavori uguali non convincono più di uno guardato
 * bene. Qui il primo screenshot è grande; gli eventuali altri restano come
 * miniature accanto, che è il loro peso reale nella decisione.
 *
 * Gli screenshot senza immagine non arrivano nemmeno: li filtra la query GROQ.
 */

/**
 * La barra di stato del telefono.
 *
 * Orario e batteria sono finti e fissi, e devono restarlo: un orario vero da
 * `new Date()` differirebbe tra server e client a ogni render al minuto, e
 * questo è il disegno di un telefono, non un orologio.
 *
 * Sta FUORI dall'area dell'immagine. Prima il mockup sovrapponeva un finto
 * notch allo screenshot, che quindi scorreva anche sotto la barra: leggeva come
 * un errore di ritaglio invece che come la cornice di un telefono.
 */
function PhoneStatusBar() {
  return (
    <div className="flex h-9 shrink-0 items-center justify-between bg-background-elevated px-4 text-foreground">
      <span className="font-mono text-[11px] font-bold tabular-nums">20:45</span>
      {/* L'isola dinamica: l'unico dettaglio che fa leggere "telefono" a colpo
          d'occhio, prima ancora della forma della scocca. */}
      <span aria-hidden className="h-5 w-16 rounded-full bg-neutral-900" />
      <span aria-hidden className="flex items-center gap-1">
        <Signal className="size-3" strokeWidth={2.5} />
        <Wifi className="size-3" strokeWidth={2.5} />
        <BatteryFull className="size-4" strokeWidth={2} />
      </span>
    </div>
  );
}

function Phone({
  screenshot,
  caption,
  large,
  priority,
}: {
  screenshot: VerticalScreenshot;
  caption: string;
  large?: boolean;
  priority?: boolean;
}) {
  const body = (
    <figure className={large ? "w-[290px] sm:w-[330px]" : "w-[130px]"}>
      {/* La scocca è nera a prescindere dal preset: un telefono è un oggetto
          nero, ed è ciò che lo distingue da un rettangolo con dentro
          un'immagine. Il ring chiaro serve al preset scuro, dove altrimenti la
          scocca sparirebbe nel fondo. */}
      <div
        className={`bg-neutral-900 shadow-2xl ring-1 ring-white/10 ${
          large ? "rounded-[2.5rem] p-2.5" : "rounded-[1.4rem] p-1.5"
        }`}
      >
        <div
          className={`flex aspect-9/19.5 flex-col overflow-hidden bg-background-elevated ${
            large ? "rounded-[2rem]" : "rounded-[1rem]"
          }`}
        >
          {/* Sotto i 130px la barra di stato diventa illeggibile e sporca:
              nelle miniature si mostra solo lo schermo. */}
          {large && <PhoneStatusBar />}
          <div className="relative flex-1">
            <Image
              src={urlFor(screenshot.image).width(large ? 720 : 300).url()}
              alt={caption}
              fill
              sizes={large ? "(min-width: 640px) 330px, 290px" : "130px"}
              priority={priority}
              className="object-cover object-top"
            />
          </div>
        </div>
      </div>
      <figcaption className="mt-4 flex items-center justify-center gap-1 text-center text-sm text-foreground-muted">
        {caption}
        {screenshot.href && screenshot.href !== "#" && (
          <ArrowUpRight className="size-3.5" aria-hidden />
        )}
      </figcaption>
    </figure>
  );

  // Un link va reso solo se porta da qualche parte: `href: "#"` è ciò che i
  // documenti incompleti lasciavano dietro, e un link che non va da nessuna
  // parte è peggio dell'assenza del link.
  return screenshot.href && screenshot.href !== "#" ? (
    <Link
      href={screenshot.href}
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

export function VerticalProof({
  anonymousCaption,
  screenshots,
}: {
  anonymousCaption: string;
  screenshots: VerticalScreenshot[];
}) {
  if (screenshots.length === 0) return null;

  const captionFor = (s: VerticalScreenshot) =>
    s.consentGiven && s.clientName ? s.clientName : anonymousCaption;

  const [first, ...rest] = screenshots;

  return (
    <div className="flex flex-col items-center gap-10 sm:flex-row sm:items-start sm:justify-center sm:gap-10">
      <Reveal className="shrink-0">
        <Phone screenshot={first} caption={captionFor(first)} large priority />
      </Reveal>

      {rest.length > 0 && (
        <ul className="flex flex-wrap justify-center gap-6 sm:mt-16 sm:max-w-[300px]">
          {rest.map((screenshot, index) => (
            <li key={screenshot.image.asset?._id ?? index}>
              <Reveal index={index + 1}>
                <Phone screenshot={screenshot} caption={captionFor(screenshot)} />
              </Reveal>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
