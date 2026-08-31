import type { CSSProperties } from "react";

/**
 * I temi delle landing verticali.
 *
 * Preset chiusi, non colori liberi. Il motivo è pratico: sette verticali con
 * sette color picker liberi diventano sette esperimenti scoordinati, e chi
 * compila un documento su Sanity non sta facendo direzione artistica. Su Sanity
 * si sceglie il preset da una lista, e al massimo si sovrascrive l'accento.
 *
 * Un preset NON è una palette. Cambiare il colore del bottone e lasciare tutto
 * il resto identico produce sette volte la stessa pagina ridipinta — che è
 * esattamente il contrario del punto: chi arriva su una landing per palestre
 * deve vedere una pagina da palestra, non la landing dei ristoranti in verde.
 * Quindi un preset porta tre cose:
 *
 * 1. `tokens` — la palette completa (fondo, inchiostro, accento, più un accento
 *    secondario decorativo e la tinta delle fasce).
 * 2. `skin` — il VESTITO: raggi, spessore dei bordi, ombre, forma e colore dei
 *    bottoni, e la voce tipografica (titoli, corpo, etichette) con il suo
 *    trattamento (maiuscolo? corsivo? crenatura?).
 * 3. `texture` — la materia di fondo.
 *
 * Tutto esce come custom property sul wrapper del layout verticale. I colori
 * cascano da soli perché i colori Tailwind del progetto sono dichiarati in
 * `@theme inline` come `var(--background)` &c.; il vestito lo leggono le classi
 * `.v-*` di `app/globals.css`, che sono lì apposta e sono l'unico punto in cui
 * un preset può cambiare la FORMA di un componente e non solo il suo colore.
 */

export const PRESET_IDS = [
  "ristorazione",
  "ospitalita",
  "fitness",
  "legale",
  "medicale",
  "retail",
  "neutro",
] as const;

export type PresetId = (typeof PRESET_IDS)[number];

export type VerticalTexture = "none" | "checkered" | "grain" | "stripes";

type PresetTokens = {
  background: string;
  backgroundElevated: string;
  foreground: string;
  foregroundMuted: string;
  brand: string;
  brandForeground: string;
  brandSubtle: string;
  border: string;
  /**
   * L'accento secondario. Non è una seconda CTA: è il colore delle cose
   * decorative (bordi di card, numeri, hover), quello che fa sembrare una
   * pagina "colorata" invece che "monocroma con un bottone rosso". Chi non ne
   * ha bisogno lo tiene uguale a `brand`.
   */
  accent: string;
  accentSubtle: string;
  /** La tinta delle fasce a tutta larghezza (la sezione prezzo). */
  surfaceAlt: string;
};

/**
 * Il vestito. Ogni campo è una custom property: nessun componente conosce i
 * preset, legge solo `var(--v-…)` attraverso le classi `.v-*`.
 */
type PresetSkin = {
  fonts: {
    /** Titoli. */
    display: string;
    /** Testo corrente — sì, cambia anche questo. */
    body: string;
    /** Etichette, bottoni, occhielli. */
    label: string;
  };
  /** Come si comportano i titoli: c'è chi sussurra e chi urla in maiuscolo. */
  title: {
    weight: string;
    tracking: string;
    transform: "none" | "uppercase";
    leading: string;
  };
  /** Occhielli e bottoni condividono lo stesso trattamento del testo. */
  label: {
    weight: string;
    tracking: string;
    transform: "none" | "uppercase";
    style: "normal" | "italic";
  };
  radius: {
    /** Card, pannelli, fasce. */
    card: string;
    /** Bottoni. `9999px` per le pillole. */
    control: string;
    /** Campi di form: una pillola come input è una pessima idea. */
    input: string;
    /** Cornici delle immagini. */
    media: string;
  };
  /** Lo spessore del bordo "forte": quello dei bottoni e dei pannelli. */
  borderStrong: string;
  /** L'ombra delle card. `none` per i preset piatti. */
  shadow: string;
  /** Il bordo del pannello prezzo — di norma l'inchiostro, non sempre. */
  panelBorder: string;
  /** Il bottone primario. Non è detto che sia inchiostro su fondo. */
  button: { bg: string; fg: string; border: string };
};

export type VerticalPreset = {
  id: PresetId;
  /** Etichetta mostrata nella lista dello Studio. */
  label: string;
  tokens: PresetTokens;
  skin: PresetSkin;
  texture: VerticalTexture;
  /**
   * Serve al browser per disegnare scrollbar e controlli di form coerenti: il
   * wrapper esce dal tema del sito, quindi lo schema va dichiarato a mano.
   */
  scheme: "light" | "dark";
};

const LIGHT_BORDER = "rgb(0 0 0 / 10%)";
const DARK_BORDER = "rgb(255 255 255 / 14%)";

/**
 * Il vestito di partenza: spigoli vivi, bordo doppio in inchiostro, etichette
 * in mono maiuscolo. È il registro "stampato" — sobrio, un po' tipografico — ed
 * è quello che i preset non ancora vestiti (legale, medicale, retail, neutro)
 * ereditano senza sorprese.
 */
const BASE_SKIN: PresetSkin = {
  fonts: {
    display: "var(--font-bricolage)",
    body: "var(--font-bricolage)",
    label: "var(--font-space-mono)",
  },
  title: {
    weight: "700",
    tracking: "-0.015em",
    transform: "none",
    leading: "1.1",
  },
  label: {
    weight: "700",
    tracking: "0.1em",
    transform: "uppercase",
    style: "normal",
  },
  radius: { card: "0px", control: "0px", input: "0px", media: "0px" },
  borderStrong: "2px",
  shadow: "none",
  panelBorder: "var(--foreground)",
  button: {
    bg: "var(--foreground)",
    fg: "var(--background)",
    border: "var(--foreground)",
  },
};

/** Applica un vestito parziale sopra la base, senza ripetere ciò che non cambia. */
function skin(overrides: {
  fonts?: Partial<PresetSkin["fonts"]>;
  title?: Partial<PresetSkin["title"]>;
  label?: Partial<PresetSkin["label"]>;
  radius?: Partial<PresetSkin["radius"]>;
  button?: Partial<PresetSkin["button"]>;
  borderStrong?: string;
  shadow?: string;
  panelBorder?: string;
}): PresetSkin {
  return {
    ...BASE_SKIN,
    ...overrides,
    fonts: { ...BASE_SKIN.fonts, ...overrides.fonts },
    title: { ...BASE_SKIN.title, ...overrides.title },
    label: { ...BASE_SKIN.label, ...overrides.label },
    radius: { ...BASE_SKIN.radius, ...overrides.radius },
    button: { ...BASE_SKIN.button, ...overrides.button },
  };
}

const PRESETS: Record<PresetId, VerticalPreset> = {
  /**
   * RISTORAZIONE — elegante e sobrio, il registro della trattoria di quelle
   * buone: crema, bruno, rosso pomodoro. Spigoli vivi e bordo doppio: è il
   * menù stampato, la lavagna dei prezzi. Titoli in Fraunces (serif con
   * un'ottica morbida), etichette in mono maiuscolo come un timbro. Zero ombre:
   * la carta non galleggia. La tovaglia a quadretti è la texture.
   */
  ristorazione: {
    id: "ristorazione",
    label: "Ristorazione (ristoranti, pizzerie, bar)",
    tokens: {
      background: "#faf6ef",
      backgroundElevated: "#ffffff",
      foreground: "#2b1d14",
      foregroundMuted: "#6b5647",
      brand: "#b3341f",
      brandForeground: "#fffaf5",
      brandSubtle: "#f7e4dc",
      border: "rgb(43 29 20 / 14%)",
      accent: "#7d7a3c",
      accentSubtle: "#ecead7",
      surfaceAlt: "#f0ebe3",
    },
    skin: skin({
      fonts: { display: "var(--font-fraunces)" },
      title: { tracking: "-0.02em" },
    }),
    texture: "checkered",
    scheme: "light",
  },

  /**
   * OSPITALITÀ — vivace, tondo, colorato.
   * Un B&B non vende autorevolezza, vende voglia di partire: qui tutto è
   * morbido. Angoli generosi (20px sulle card, pillole sui bottoni), bordi
   * sottili e ombre basse invece delle cornici spesse, due colori invece di
   * uno — verde acqua per le CTA, albicocca per tutto ciò che decora. Titoli in
   * Outfit, corpo ed etichette in Nunito: niente maiuscoletto mono, le
   * etichette diventano pastiglie. È il preset che si allontana di più dal
   * registro "stampato" degli altri, ed è voluto.
   */
  ospitalita: {
    id: "ospitalita",
    label: "Ospitalità (B&B, case vacanza, hotel)",
    tokens: {
      background: "#fff9f2",
      backgroundElevated: "#ffffff",
      foreground: "#163b35",
      foregroundMuted: "#5b7873",
      brand: "#0f8478",
      brandForeground: "#ffffff",
      brandSubtle: "#d5efe9",
      border: "rgb(22 59 53 / 12%)",
      accent: "#f0994a",
      accentSubtle: "#ffe8d3",
      surfaceAlt: "#e7f3ef",
    },
    skin: skin({
      fonts: {
        display: "var(--font-outfit)",
        body: "var(--font-nunito)",
        label: "var(--font-nunito)",
      },
      title: { tracking: "-0.025em", leading: "1.08" },
      label: { weight: "800", tracking: "0.02em", transform: "none" },
      radius: { card: "20px", control: "9999px", input: "14px", media: "20px" },
      borderStrong: "2px",
      shadow: "0 18px 40px -24px rgb(22 59 53 / 45%)",
      panelBorder: "var(--brand)",
      button: {
        bg: "var(--brand)",
        fg: "var(--brand-foreground)",
        border: "var(--brand)",
      },
    }),
    texture: "grain",
    scheme: "light",
  },

  /**
   * FITNESS — molto dinamico, moderno, acceso.
   * L'unico preset scuro, ed è il punto: una palestra si fotografa al neon, non
   * alla luce del giorno. Grafite quasi nera, lime elettrico, arancio come
   * secondo accento. Titoli in Anton MAIUSCOLO e serratissimo — il manifesto
   * appeso allo specchio — corpo in Archivo, etichette in Archivo corsivo
   * maiuscolo, con l'occhiello che diventa un blocco inclinato. Angoli quasi
   * vivi (2px) e ombra dura sfalsata all'hover, non una nuvoletta: qui niente
   * è morbido. La texture è a bande diagonali.
   */
  fitness: {
    id: "fitness",
    label: "Fitness (palestre, personal trainer)",
    tokens: {
      background: "#0b0c0e",
      backgroundElevated: "#15181c",
      foreground: "#f4f6f7",
      foregroundMuted: "#98a2ab",
      brand: "#d4ff2e",
      brandForeground: "#0b0c0e",
      brandSubtle: "#2b3610",
      border: DARK_BORDER,
      accent: "#ff5a1f",
      accentSubtle: "#3a1a0c",
      surfaceAlt: "#15181c",
    },
    skin: skin({
      fonts: {
        display: "var(--font-anton)",
        body: "var(--font-archivo)",
        label: "var(--font-archivo)",
      },
      // Anton è monopeso: `700` lo farebbe ingrassare al browser, che è la
      // ricetta per i contorni sporchi. Resta 400 e a spingere pensa il corpo.
      title: { weight: "400", tracking: "-0.02em", transform: "uppercase", leading: "0.95" },
      label: { weight: "800", tracking: "0.08em", style: "italic" },
      radius: { card: "2px", control: "2px", input: "2px", media: "2px" },
      borderStrong: "2px",
      shadow: "none",
      panelBorder: "var(--brand)",
      button: {
        bg: "var(--brand)",
        fg: "var(--brand-foreground)",
        border: "var(--brand)",
      },
    }),
    texture: "stripes",
    scheme: "dark",
  },

  /** Studi legali: avorio e verde bottiglia, serif da editoria. Nessuna texture. */
  legale: {
    id: "legale",
    label: "Legale (avvocati, commercialisti, notai)",
    tokens: {
      background: "#f7f6f2",
      backgroundElevated: "#ffffff",
      foreground: "#1c2419",
      foregroundMuted: "#575f52",
      brand: "#2f5d3a",
      brandForeground: "#ffffff",
      brandSubtle: "#dfe8e0",
      border: "rgb(28 36 25 / 13%)",
      accent: "#8a7b30",
      accentSubtle: "#ece7d9",
      surfaceAlt: "#efeee8",
    },
    skin: skin({
      fonts: { display: "var(--font-newsreader)" },
      title: { tracking: "-0.01em" },
    }),
    texture: "none",
    scheme: "light",
  },

  /** Dentisti e studi medici: bianco freddo e blu. Pulito è il messaggio. */
  medicale: {
    id: "medicale",
    label: "Medicale (dentisti, studi medici, fisioterapia)",
    tokens: {
      background: "#f4f8fb",
      backgroundElevated: "#ffffff",
      foreground: "#10202e",
      foregroundMuted: "#4d6070",
      brand: "#0d6ba8",
      brandForeground: "#ffffff",
      brandSubtle: "#d8e9f5",
      border: "rgb(16 32 46 / 12%)",
      accent: "#2aa6a0",
      accentSubtle: "#d5efee",
      surfaceAlt: "#e8f1f8",
    },
    skin: skin({
      fonts: { display: "var(--font-dm-sans)", body: "var(--font-dm-sans)" },
      radius: { card: "10px", control: "6px", input: "6px", media: "10px" },
      shadow: "0 12px 30px -22px rgb(16 32 46 / 40%)",
    }),
    texture: "none",
    scheme: "light",
  },

  /** E-commerce artigianali e negozi: carta e terracotta. */
  retail: {
    id: "retail",
    label: "Retail (negozi, e-commerce artigianali)",
    tokens: {
      background: "#faf7f4",
      backgroundElevated: "#ffffff",
      foreground: "#241d18",
      foregroundMuted: "#625549",
      brand: "#a8482a",
      brandForeground: "#ffffff",
      brandSubtle: "#f2e0d8",
      border: "rgb(36 29 24 / 12%)",
      accent: "#6d7f5c",
      accentSubtle: "#e6ebdf",
      surfaceAlt: "#f1ece6",
    },
    skin: skin({
      fonts: { display: "var(--font-bricolage)" },
    }),
    texture: "grain",
    scheme: "light",
  },

  /** La palette del sito in chiaro: il default finché la nicchia non ha il suo. */
  neutro: {
    id: "neutro",
    label: "Neutro (palette dello studio)",
    tokens: {
      background: "#f5f4ef",
      backgroundElevated: "#ffffff",
      foreground: "#1a1a1a",
      foregroundMuted: "#52525b",
      brand: "#c33e00",
      brandForeground: "#ffffff",
      brandSubtle: "#ffe8e0",
      border: LIGHT_BORDER,
      accent: "#c33e00",
      accentSubtle: "#ffe8e0",
      surfaceAlt: "#ebeae4",
    },
    skin: BASE_SKIN,
    texture: "none",
    scheme: "light",
  },
};

export function resolvePreset(id: string | null | undefined): VerticalPreset {
  return PRESETS[id as PresetId] ?? PRESETS.neutro;
}

/** La lista per il campo `theme.preset` dello schema Sanity. */
export const PRESET_OPTIONS = PRESET_IDS.map((id) => ({
  title: PRESETS[id].label,
  value: id,
}));

/**
 * Traduce un preset nelle custom property da mettere sul wrapper.
 *
 * `accentOverride` tocca solo `--brand`: `--brand-subtle` e `--brand-foreground`
 * restano quelli del preset. Derivarli automaticamente da un hex arbitrario
 * significherebbe generare coppie che non passano il contrasto senza che nessuno
 * se ne accorga — meglio un accento diverso su una base collaudata.
 *
 * `fontFamily` sul wrapper è ciò che cambia il font del CORPO: Tailwind mette la
 * famiglia di default su `html`, e una dichiarazione qui la sovrascrive per
 * tutto il sottoalbero senza toccare una sola classe nei componenti.
 */
export function presetStyle(
  preset: VerticalPreset,
  accentOverride?: string | null,
): CSSProperties {
  const { tokens, skin: s } = preset;

  return {
    "--background": tokens.background,
    "--background-elevated": tokens.backgroundElevated,
    "--foreground": tokens.foreground,
    "--foreground-muted": tokens.foregroundMuted,
    "--brand": accentOverride || tokens.brand,
    "--brand-foreground": tokens.brandForeground,
    "--brand-subtle": tokens.brandSubtle,
    "--border": tokens.border,

    "--v-accent": tokens.accent,
    "--v-accent-subtle": tokens.accentSubtle,
    "--v-surface-alt": tokens.surfaceAlt,

    "--font-vertical-display": s.fonts.display,
    "--font-vertical-body": s.fonts.body,
    "--font-vertical-label": s.fonts.label,

    "--v-title-weight": s.title.weight,
    "--v-title-tracking": s.title.tracking,
    "--v-title-transform": s.title.transform,
    "--v-title-leading": s.title.leading,

    "--v-label-weight": s.label.weight,
    "--v-label-tracking": s.label.tracking,
    "--v-label-transform": s.label.transform,
    "--v-label-style": s.label.style,

    "--v-radius-card": s.radius.card,
    "--v-radius-control": s.radius.control,
    "--v-radius-input": s.radius.input,
    "--v-radius-media": s.radius.media,
    "--v-border-strong": s.borderStrong,
    "--v-shadow": s.shadow,
    "--v-panel-border": s.panelBorder,
    "--v-btn-bg": s.button.bg,
    "--v-btn-fg": s.button.fg,
    "--v-btn-border": s.button.border,

    colorScheme: preset.scheme,
    backgroundColor: "var(--background)",
    color: "var(--foreground)",
    fontFamily: "var(--font-vertical-body)",
  } as CSSProperties;
}
