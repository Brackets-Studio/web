import {
  Anton,
  Archivo,
  DM_Sans,
  Fraunces,
  Newsreader,
  Nunito,
  Outfit,
} from "next/font/google";

/**
 * I font display delle landing verticali.
 *
 * Il preset attivo si conosce solo a runtime (arriva da Sanity), quindi tutte
 * le famiglie vanno dichiarate qui a livello di modulo — `next/font` non accetta
 * chiamate dinamiche. Da qui le tre conseguenze di questo file:
 *
 * 1. `preload: false` su tutte. Senza, Next emetterebbe un `<link rel=preload>`
 *    per ognuna su ogni landing: quattro font scaricati per usarne uno. Il costo
 *    è un round trip in più sul titolo; `display: "swap"` fa sì che nel frattempo
 *    si legga il fallback invece del nulla.
 * 2. Ogni famiglia ha la SUA variabile (`--font-fraunces`, ...), non una comune.
 *    Il layout applica tutte e quattro le classi `.variable` — sono solo
 *    dichiarazioni di custom property, il browser non scarica un font finché
 *    nessuna regola lo usa — e poi il preset punta `--font-vertical-display`
 *    a quella giusta. Se invece condividessero il nome della variabile, l'ultima
 *    classe applicata vincerebbe e il preset non conterebbe niente.
 * 3. Il modulo è importato SOLO dal layout `(verticali)/[vertical]`, così il
 *    resto del sito non paga nemmeno il CSS di queste famiglie.
 *
 * Il corpo del testo non è più per forza Bricolage: ogni preset sceglie anche
 * quello (`skin.fonts.body`). Un B&B letto in Bricolage e una palestra letta in
 * Bricolage sono la stessa pagina — la voce di una nicchia sta nel testo
 * corrente almeno quanto nei titoli. Bricolage e Space Mono restano disponibili
 * (li monta il root layout su `<html>`) e sono la scelta del preset sobrio.
 */

/** Ristorazione e ospitalità — serif variabile, caldo, con un'ottica morbida. */
export const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  axes: ["SOFT", "WONK", "opsz"],
});

/** Fitness — il corpo del testo e le etichette: grotesk stretto, tanti pesi. */
export const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

/**
 * Fitness — i titoli. Anton è condensato e monopeso: sale di corpo senza
 * allargarsi, che è esattamente il manifesto appeso in palestra. Monopeso vuol
 * dire che `font-bold` va EVITATO: il browser lo sintetizzerebbe ingrassando i
 * contorni. Ci pensa `--v-title-weight`, che per questo preset resta 400.
 */
export const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

/** Ospitalità — titoli: geometrico dalle forme aperte, cordiale senza infantile. */
export const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

/** Ospitalità — corpo ed etichette: terminali arrotondati, la stessa aria delle card. */
export const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

/** Legale — serif da editoria, autorevole senza essere pomposo. */
export const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

/** Medicale — geometrico pulito, zero personalità: qui è un pregio. */
export const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

/** Le classi da applicare tutte insieme sul wrapper del tema verticale. */
export const verticalFontClasses = [
  fraunces.variable,
  archivo.variable,
  anton.variable,
  outfit.variable,
  nunito.variable,
  newsreader.variable,
  dmSans.variable,
].join(" ");
