import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

/**
 * La chrome del sito vive qui e non nel layout `[locale]`, perché le landing
 * verticali (`(verticali)`) devono restare anonime: niente navbar con le voci
 * dello studio, niente footer con tutti i link. Un route group non salta il
 * layout del genitore, quindi l'unico modo di escludere quelle pagine è
 * spostare la chrome in un gruppo fratello.
 *
 * `not-found.tsx` ed `error.tsx` restano invece a livello `[locale]` e montano
 * Navbar/Footer da soli: il segmento dinamico `[vertical]` cattura ogni path a
 * un segmento sotto `/it/`, quindi un 404 dentro `(verticali)` intercetterebbe
 * anche i semplici errori di battitura, lasciando il visitatore senza un modo
 * di raggiungere il sito.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
