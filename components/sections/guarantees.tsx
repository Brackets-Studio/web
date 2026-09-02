import { getTranslations } from "next-intl/server";
import { StackedSection } from "@/components/layout/stacked-section";
import { SectionHeader } from "@/components/ui/section-header";
import { Reveal } from "@/components/ui/reveal";

type Guarantee = { question: string; answer: string };

/**
 * Le garanzie di `/come-lavoriamo`, ed è la ragione per cui quella pagina
 * esiste: le altre sezioni (approccio, processo, stack) raccontano *come*
 * lavoriamo, questa risponde a *cosa succede se qualcosa va storto*. È la paura
 * numero uno di chi ci scrive, e finora non era scritta da nessuna parte.
 *
 * Volutamente NON è un accordion, a differenza delle FAQ in home. Un accordion
 * dice "leggi solo quello che ti interessa"; qui il punto è che si legga tutto,
 * anche la parte che nessuno avrebbe aperto — quella su cosa succede se
 * sparissimo. Il costo è una pagina più lunga, ed è accettabile.
 *
 * Marcato come `<dl>`: sono coppie domanda/risposta, non un elenco di feature.
 */
export async function Guarantees() {
  const t = await getTranslations("howWeWork.guarantees");
  const items = t.raw("items") as Guarantee[];

  return (
    <StackedSection>
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <SectionHeader eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

        <dl className="mt-12 grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2">
          {items.map((item, index) => (
            <Reveal key={item.question} index={index % 2}>
              <dt className="flex items-baseline gap-3 text-lg font-semibold tracking-[-0.01em] text-foreground">
                <span
                  aria-hidden
                  className="font-mono text-sm text-brand tabular-nums"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                {item.question}
              </dt>
              <dd className="mt-3 pl-9 text-sm leading-relaxed text-foreground-muted">
                {item.answer}
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </StackedSection>
  );
}
