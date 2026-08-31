import { siteConfig } from "@/lib/site";

/**
 * Le poche cose che layout e pagina di una landing verticale devono condividere.
 *
 * Stanno qui e non nel layout perché una pagina che importa dal proprio layout è
 * un giro strano da leggere, e perché `telHref` serviva già in tre punti scritto
 * a mano.
 */

/**
 * L'id dell'hero. La barra CTA fissa lo osserva per sapere quando comparire:
 * se i due valori divergessero, la barra resterebbe visibile sempre.
 */
export const HERO_ID = "vertical-hero";

/** `tel:` vuole un numero senza spazi. */
export function telHref() {
  return `tel:${siteConfig.phone.replace(/\s/g, "")}`;
}
