import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/sections/hero";
import { Services } from "@/components/sections/services";
import { Process } from "@/components/sections/process";
import { CaseStudies } from "@/components/sections/case-studies";
import { Testimonials } from "@/components/sections/testimonials";
import { Approach } from "@/components/sections/approach";
import { Faqs } from "@/components/sections/faqs";
import { Footer } from "@/components/layout/footer";
import { DetailProvider } from "@/components/detail/detail-context";
import { DetailModal } from "@/components/detail/detail-modal";

export default function Home() {
  return (
    <DetailProvider>
      <Navbar />
      <Hero />
      <Services />
      <Process />
      <CaseStudies />
      <Testimonials />
      <Approach />
      <Faqs />
      <Footer />
      <DetailModal />
    </DetailProvider>
  );
}
