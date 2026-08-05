import { getTranslations } from "next-intl/server";
import { StackedSection } from "@/components/layout/stacked-section";
import { Reveal } from "@/components/ui/reveal";

const SERVICE_KEYS = ["web", "mobile", "ai", "cloud"] as const;

export async function TechStack() {
  const t = await getTranslations("services");
  const techStackT = await getTranslations("techStack");

  const tags = Array.from(
    new Set(SERVICE_KEYS.flatMap((key) => t.raw(`items.${key}.tags`) as string[]))
  );

  return (
    <StackedSection>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <Reveal className="flex flex-col items-center gap-6">
          <p className="font-mono text-xs uppercase tracking-wide text-foreground-muted">
            {techStackT("title")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {tags.map((tag) => (
              <span key={tag} className="font-mono text-sm text-foreground-muted">
                {tag}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </StackedSection>
  );
}
