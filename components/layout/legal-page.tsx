import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { StackedSection } from "@/components/layout/stacked-section";

export function LegalPage({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <>
      <Navbar />
      <StackedSection>
        <div className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
          <h1 className="text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 font-mono text-xs text-foreground-muted">{updated}</p>
          <p className="mt-8 text-foreground-muted">{intro}</p>
          <div className="mt-10 flex flex-col gap-8">{children}</div>
        </div>
      </StackedSection>
      <Footer />
    </>
  );
}
