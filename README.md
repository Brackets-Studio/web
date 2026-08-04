# CONTESTO DEL PROGETTO

Sto costruendo il sito di "Bracket Studio", uno studio di sviluppo software 
(attualmente one-person, con piano di espansione futura) specializzato in 
SaaS custom, integrazioni API (WhatsApp Business, Telnyx, automazione 
telecom), automazione documentale/OCR e infrastruttura cloud.

Il fondatore (Tobia Bartolomei) ha già un sito personale a tob.codes 
costruito in Next.js + Framer Motion + Tailwind, che useremo come base 
tecnica di partenza. Prima di proporre modifiche o nuovo codice, esplora 
sempre la struttura di cartelle e componenti esistenti nel repo.

# OBIETTIVO

Costruire l'identità UI e i componenti core del sito di Bracket Studio, 
ispirandoci esplicitamente al design system Geist di Vercel, ma con 
un'identità brand distintiva e non un clone generico.

# STACK TECNICO
- Next.js (App Router)
- Tailwind CSS
- Framer Motion per le animazioni
- Dark mode e light mode con persistenza (localStorage + prefers-color-scheme)

# BRAND IDENTITY DA APPLICARE

## Naming e concetto
"Bracket" richiama le parentesi graffe `{}` del codice: il team che 
racchiude/tiene insieme sviluppo, design e consulenza in un unico blocco 
coerente. Il messaggio visivo deve comunicare: precisione tecnica, 
automazione, affidabilità infrastrutturale. Evita immaginario "corporate" 
generico o iconografia da agenzia creativa (no illustrazioni colorate, 
no mascotte, no gradient arcobaleno).

## Logo
Il logo è il simbolo `{}` (due parentesi graffe), reso come mark inline via 
`components/ui/bracket-mark.tsx` (mono, currentColor) invece di asset 
raster — resta nitido in entrambi i temi senza bisogno di due PNG separati.

## Palette colori (dark-first, come Geist)
- Dark background primario: #0a0a0a
- Dark background secondario/elevato: #171717
- Light background primario: #fafafa
- Testo dark mode: #e5e7eb (mai bianco puro #ffffff)
- Testo light mode: quasi nero, mai #000000 puro
- Bordi: gray neutro a bassa opacità, non shadow pesanti
- UN SOLO colore accento acceso (proponi 2-3 opzioni coerenti col concetto 
  "loop/energia/automazione", es. ciano elettrico o blu-verde), usato solo 
  per CTA, link attivi, stati hover — mai come colore decorativo diffuso

## Tipografia
- Titoli: sans geometrico (Geist Sans o Inter), peso massimo 600, 
  letter-spacing negativo su headline grandi (stile -2% tracking)
- Corpo testo: stessa famiglia, peso 400-500
- Dettagli tecnici/tag/badge: monospace (Geist Mono o JetBrains Mono)
- Headline hero: massimo 8-10 parole, mai paragrafi lunghi in hero

# COSA EVITARE ESPLICITAMENTE (Claude tende a scegliere queste opzioni di default)
- Font di sistema generici senza personalità (Arial, system-ui puro)
- Palette con più di un colore accento acceso
- Ombre drop pesanti e diffuse — usa invece shadow stratificate sottili 
  (4-12% opacità nera) con un hairline ring interno sulle card
- Animazioni bounce/elastic eccessive
- Border-radius incoerenti tra componenti (definisci una scala fissa: 
  0px, 4px, 8px, 16px, pill 100px solo per CTA principali)
- Hero con più di un elemento animato "importante" in contemporanea

# ANIMAZIONI (Framer Motion)
- Durata micro-interazioni: 200-400ms, easing "ease-out" o custom cubic-bezier, 
  mai animazioni lente/decorative
- Scroll reveal: fade (opacity 0→1) + slide verticale leggero (10-20px), 
  applicato con staggering minimo tra elementi di una stessa sezione, 
  NON su ogni singolo elemento della pagina
- Hover su card/bottoni: scale leggero (1.02) + cambio colore bordo, 
  nessun bounce
- Un solo momento "wow" concentrato nell'hero (es. leggera animazione del 
  simbolo loop nel logo al caricamento, o gradiente animato molto sottile 
  sullo sfondo hero) — il resto della pagina deve restare calmo e leggibile
- Transizione dark/light mode: crossfade colori 200-300ms, mai scatto istantaneo
- Implementa SEMPRE il supporto a prefers-reduced-motion, disabilitando le 
  animazioni non essenziali per chi lo richiede

# STRUTTURA COMPONENTI DA CREARE (in quest'ordine)
1. Design tokens (colori, spacing, radius, typography) come file centralizzato 
   Tailwind config / CSS variables, PRIMA di ogni componente
2. ThemeSwitcher (toggle dark/light in stile Vercel, footer o navbar)
3. Navbar minimale (logo + 3-4 link + CTA)
4. Hero section (headline breve + sottolinea + CTA + eventuale animazione loop)
5. Sezione Servizi (card con badge monospace per tecnologie: WhatsApp API, 
   OCR, Cloud, SaaS)
6. Sezione Case Study (Smartables e altri progetti, formato problema→
   soluzione→risultato)
7. Footer con link social e ThemeSwitcher

# ISTRUZIONI OPERATIVE PER CLAUDE CODE
- Prima di scrivere codice, leggi ed esplora i file esistenti del progetto 
  (struttura cartelle, componenti già presenti, tailwind.config) e riportami 
  cosa hai trovato prima di procedere
- Implementa direttamente le modifiche, non limitarti a suggerirle, salvo 
  quando ti chiedo esplicitamente solo un'opinione
- Dopo ogni componente completato, fornisci un breve riepilogo di cosa hai 
  creato e perché, in prosa, senza liste eccessive
- Committa il lavoro a piccoli step logici (design tokens → componente 
  singolo → integrazione), non tutto in un unico blocco
- Se una scelta di design non è specificata sopra, motivala coerentemente 
  con i principi di restraint e coerenza descritti (Vercel/Geist: "no second 
  accent color, no gradient decoration, no display weight above 600")