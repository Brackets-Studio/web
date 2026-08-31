import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/site";

/**
 * Il footer delle landing verticali.
 *
 * Quattro righe: chi siamo, come ci si contatta, i due link legali, l'anno.
 * Niente logo gigante, niente social, niente mappa del sito — la pagina non è un
 * ingresso al sito dello studio, e un footer pieno di link è solo un altro modo
 * di perdere chi stava per chiamare.
 *
 * I link legali ci sono perché servono davvero: la pagina monta il banner cookie
 * e raccoglie dati da un modulo, quindi privacy e cookie policy devono essere
 * raggiungibili. Hanno `prefetch={false}`: sono uscite rare, non vale scaricarle
 * per ogni visitatore. Sotto, la barra CTA fissa su mobile copre lo spazio in
 * fondo, da cui il padding extra.
 */
export function VerticalFooter({ telHref }: { telHref: string }) {
  return (
    <footer className=" border-t border-border pb-28 sm:pb-0">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-10 text-sm text-foreground-muted sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div className="flex flex-col gap-1">
          <p className="v-label text-xs uppercase text-foreground">{siteConfig.name}</p>
          <a href={telHref} className="w-fit hover:text-brand">
            {siteConfig.phone}
          </a>
          <a href={`mailto:${siteConfig.email}`} className="w-fit hover:text-brand">
            {siteConfig.email}
          </a>
        </div>

        <div className="flex flex-col gap-1 text-xs sm:items-end">
          <div className="flex gap-4">
            <Link href="/privacy" prefetch={false} className="hover:text-brand">
              Privacy
            </Link>
            <Link href="/cookie-policy" prefetch={false} className="hover:text-brand">
              Cookie
            </Link>
          </div>
          <p className="v-label">
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
