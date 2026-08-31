import { getTranslations } from "next-intl/server";
import { Hero } from "@/components/sections/hero";
import { SocialProof } from "@/components/sections/social-proof";
import { TechStack } from "@/components/sections/tech-stack";
import { Services } from "@/components/sections/services";
import { Process } from "@/components/sections/process";
import { CaseStudies } from "@/components/sections/case-studies";
import { Testimonials } from "@/components/sections/testimonials";
import { AnalyzerCta } from "@/components/sections/analyzer-cta";
import { Approach } from "@/components/sections/approach";
import { Faqs } from "@/components/sections/faqs";
import { Contact } from "@/components/sections/contact";

async function faqJsonLd() {
  const t = await getTranslations("faqs");
  const items = t.raw("items") as { question: string; answer: string }[];

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const faqData = await faqJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
      {/* Ordine = l'argomentazione che deve seguire chi arriva qui:
          prova ("l'abbiamo già fatto") → offerta → percorso → perché noi →
          nessun lock-in → obiezioni → richiesta. La prova sta subito sotto la
          promessa dell'hero, non a metà pagina. */}
      <Hero />
      <SocialProof locale={locale} />
      <CaseStudies />
      <Testimonials />
      {/* Subito dopo la prova, e prima dell'offerta: chi ha appena letto cosa
          sappiamo fare è nel punto in cui gli viene da chiedersi come sta messo
          il proprio sito. Sta qui e non tra i due blocchi di prova per non
          spezzarli — spostarlo è una riga. */}
      <AnalyzerCta />
      <Services locale={locale} />
      <Process />
      <TechStack />
      <Approach />
      <Faqs />
      <Contact />
    </>
  );
}
