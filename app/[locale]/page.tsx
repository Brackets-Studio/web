import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/sections/hero";
import { TechStack } from "@/components/sections/tech-stack";
import { Services } from "@/components/sections/services";
import { Process } from "@/components/sections/process";
import { CaseStudies } from "@/components/sections/case-studies";
import { Testimonials } from "@/components/sections/testimonials";
import { Approach } from "@/components/sections/approach";
import { Faqs } from "@/components/sections/faqs";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/layout/footer";

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

export default async function Home() {
  const faqData = await faqJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
      <Navbar />
      <Hero />
      <TechStack />
      <Services />
      <Process />
      <CaseStudies />
      <Testimonials />
      <Approach />
      <Faqs />
      <Contact />
      <Footer />
    </>
  );
}
