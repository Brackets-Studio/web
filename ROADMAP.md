# Roadmap sito — Bracket Studio

Idee di prodotto per il sito dello studio, ordinate per rapporto impatto/sforzo.
Non è un backlog vincolante: è la lista delle cose che, se fatte, ci separano
dalle altre agenzie italiane invece di renderci "un'altra agenzia con un sito
carino".

Stato: `☐` da fare · `◐` in corso · `☑` fatto

---

## Punto di partenza (cosa c'è già, settembre 2026)

- Next.js 16 (App Router) + Sanity per case study, blog e testimonial, localizzati it/en.
- Pagine: home, `/work` (+ dettaglio), `/blog` (+ dettaglio), `/team`, `/pricing`,
  `/privacy`, `/cookie-policy`, e la landing verticale `/it/ristoranti` (in noindex).
- Form contatti via server action + Brevo, newsletter Brevo, prenotazione su cal.com.
- JSON-LD: `Organization`, `WebSite`, `FAQPage`, `Article`. Sitemap e robots dinamici.

Il livello di partenza è già sopra la media. Quello che segue serve a fare il salto
da "sito di presentazione" a "sito che porta lavoro da solo".

---

## 1. Le tre cose ad alto impatto

### ☑ 1.1 — Analisi gratuita del sito (`/analisi`)

Un tool pubblico: l'utente incolla l'indirizzo del proprio sito, noi lo misuriamo
con l'API PageSpeed Insights di Google e restituiamo un referto leggibile da chi
non è del settore — voti in italiano semplice, i problemi trovati spiegati come
conseguenze per il suo business, e una CTA per farli sistemare a noi.

**Perché è la prima.** È l'unico formato in cui un potenziale cliente
si auto-qualifica *e* vede quanto siamo bravi prima ancora di parlarci. Usa
esattamente le competenze che vendiamo. E nessuno studio italiano piccolo ce l'ha.

**Regola di design non negoziabile:** zero gergo. Niente "LCP", "render-blocking",
"CLS". Ogni numero deve essere accompagnato da cosa significa per chi vende
qualcosa online.

**Com'è fatta.** `app/[locale]/analisi/page.tsx` → `components/sections/site-analyzer.tsx`
(modulo, attesa raccontata, referto) → `lib/actions/analyze.ts` (server action che
interroga PageSpeed Insights) → `lib/analysis/report.ts` (traduce i ~150 audit di
Lighthouse nelle poche voci che un imprenditore può capire). Tutto il gergo muore
in `report.ts`: da lì in poi circolano solo chiavi di traduzione, e i testi stanno
nei file `messages` sotto `analyze`.

**Dove si trova.** Non è nella navbar (che resta ferma a quattro voci): sta nel
gruppo *Risorse* del menu, nel footer, e soprattutto nel blocco in homepage
(`components/sections/analyzer-cta.tsx`, subito dopo i testimonial) dove c'è già
il campo: quello che ci si scrive arriva a `/analisi?url=…` e l'analisi parte da
sola.

Richiede `PAGESPEED_API_KEY` (vedi `.env.example`): senza, la pagina risponde con
il messaggio "fuori servizio" invece del referto. **La chiave non può avere
restrizioni per referrer HTTP**: la chiamata parte dal server, dove un referrer
non c'è, e Google risponde 403. In Google Cloud Console la configurazione giusta
è *Application restrictions: None* + *API restrictions: PageSpeed Insights API*
(la chiave non viene mai esposta al browser, quindi va bene così).

**Manutenzione.** Lighthouse rinomina e ritira audit a ogni major — in 12 le
"opportunità" di performance sono diventate audit `*-insight` e otto id sono
spariti insieme. Un id morto non dà errore: fa solo sparire dei problemi dal
referto. `lib/analysis/report.ts` avvisa in console durante lo sviluppo quando
un id del catalogo non arriva più nella risposta. Catalogo verificato contro
Lighthouse 13.4.1.

Estensioni future: report PDF via email (lead capture), confronto con un
concorrente, ricontrollo automatico mensile con avviso via email.

### ◐ 1.2 — Landing verticali indicizzate

Verticali da coprire: ristoranti, palestre e personal trainer, studi legali,
dentisti, hotel e B&B, e-commerce artigianali, agenzie immobiliari.

Ogni pagina con il suo case study, il suo prezzo, le sue obiezioni, e JSON-LD
`Service` + `LocalBusiness`. "Sviluppo app Bologna" è una guerra persa; "sito per
ristorante con prenotazioni" no.

**Fatto.** Il template è guidato dai dati (document type `vertical` su Sanity) e
vive in `app/[locale]/(verticali)/`, fuori dalla chrome del sito: le landing non
hanno navbar né footer dello studio, solo nome, telefono e i due link legali —
chi arriva da una ricerca locale deve trovare il numero, non la porta per il
resto del sito. Le altre pagine sono passate sotto `(site)/`, che è dove ora
stanno Navbar e Footer.

Il tema di ogni nicchia sta in `lib/verticals/presets.ts`: sette preset chiusi
(palette completa + font dei titoli + texture), scelti da una lista su Sanity con
il solo accento sovrascrivibile. I token si applicano ridefinendo le custom
property su un wrapper, quindi la landing ignora anche il tema chiaro/scuro del
sito — è voluto: senza navbar non c'è più un toggle, e una pagina di vendita deve
restare quella disegnata. Sette color picker liberi avrebbero prodotto sette
esperimenti scoordinati; il preset produce sette landing coerenti.

Le impostazioni condivise (prezzo, obiezioni comuni, CTA, etichette) stanno nel
singleton `verticalDefaults`: prima erano duplicate identiche su ogni documento,
e con sette verticali ogni ritocco al listino sarebbero state sette modifiche a
mano. Sul singolo `vertical` gli stessi campi restano come override.

**Fatto (verificato settembre 2026).** Numero WhatsApp/telefono reale in
`lib/site.ts` (non più placeholder). OG image per verticale
(`app/[locale]/(verticali)/[vertical]/opengraph-image.tsx`, `ImageResponse`,
zero dipendenze, usa i colori del preset risolto). Eventi analytics su
CTA telefono/WhatsApp (`components/verticals/cta-links.tsx`) e sull'invio del
modulo di richiamata — vedi anche §5 (`@vercel/analytics` ora nel progetto).

**Da fare, rimandato per scelta esplicita (non in questo giro).**

- Togliere il `noindex`: le pagine sono ancora escluse dai motori per scelta,
  ed è quello il punto dell'intera voce.
- Scrivere le altre cinque verticali (ci sono solo ristoranti e B&B).
- Caricare `hero.image` su ogni verticale: senza, l'hero ricade sul fondo tinto
  del preset e perde la cosa che più dice "questa pagina parla di te".

### ☐ 1.3 — Case study con numeri veri, in formato prima/dopo

Il campo `metrics[]` su Sanity esiste già ma è decorativo. Va reso la spina dorsale:

- Screenshot prima/dopo affiancati (slider di confronto).
- Punteggi Lighthouse prima/dopo (si collegano bene a 1.1).
- Una riga di risultato di business: "prenotazioni online: 0 → 140/mese".
- Un blocco "cosa abbiamo sbagliato / cosa rifaremmo". Raro, credibilissimo,
  ci distingue da ogni agenzia che pubblica solo vittorie.

---

## 2. Sezioni che mancano rispetto agli studi comparabili

- ☑ **Loghi clienti sotto l'hero.** `components/sections/social-proof.tsx`,
  subito sotto `<Hero />` in home: marquee CSS-only (stesso pattern di
  `tech-stack.tsx`, fade ai bordi, si ferma su hover). Contenuto dal singleton
  Sanity `socialProof` (loghi, etichetta opzionale): sezione assente finché
  non è compilato, niente placeholder vuoti in produzione. Niente numeri/stat:
  scartati per scelta — pochi progetti reali rendono un contatore poco
  credibile.
- ☐ **Recensioni Google incorporate**, non solo i testimonial che gestiamo noi.
  La differenza tra "dicono di noi" e "verificabile" è tutta lì.
- ☑ **Una pagina per servizio** (`/servizi/<slug>`, indice su `/servizi`). I
  servizi non sono più hardcoded in `messages/*.json`: vivono nel document type
  Sanity `service` (bilingue), e la stessa sorgente alimenta sia la sezione
  home (`components/sections/services.tsx` + `services-accordion.tsx`) sia le
  pagine di dettaglio. Volutamente barebone: niente ancora oltre
  eyebrow/descrizione/highlights/corpo opzionale.
- ☐ **Pagina "Come lavoriamo" esplicita**: contratto tipo, chi tocca il codice,
  cosa succede se spariamo, SLA di risposta. La paura numero uno di un cliente
  italiano è restare in ostaggio dell'agenzia. Dirgli "il codice è tuo, ecco il
  repo, ecco come porti via tutto in un giorno" chiude trattative.
- ☑ **Preventivatore interattivo** su `/pricing` (`components/sections/quote-calculator.tsx`):
  scelta del servizio → domande adattive → fascia di prezzo e tempistica
  calcolate → form di contatto (`lib/actions/quote.ts`, stesso pattern Brevo
  di `contact.ts`/`callback.ts`). Prezzi, domande e moltiplicatori vivono nel
  singleton Sanity `pricingSettings` — **fonte unica dei prezzi dello studio**:
  cambiare un `basePrice` in Studio aggiorna insieme le card di `/pricing`, il
  calcolatore e il teaser "a partire da" sulle pagine `/servizi/<slug>`, senza
  toccare codice. (Le landing verticali restano su un listino loro,
  `verticalDefaults`/`vertical.price` — pacchetti fissi per nicchia, non
  preventivi adattivi: volutamente non unificato con `pricingSettings`.)

---

## 3. Cose che fanno "wow" e sono coerenti con uno studio di sviluppo

- ☐ **`/lab`** — esperimenti, componenti open source, piccoli tool. È il segnale
  che siamo sviluppatori veri e non rivenditori di template. Economico, molto
  differenziante in Italia.
- ☐ **OG image dinamiche** (`opengraph-image.tsx` con `next/og`) per blog e case
  study. Mezza giornata di lavoro, effetto sproporzionato su ogni link condiviso.
- ☐ **Portale cliente minimo** (`/clienti`, accesso via magic link): stato del
  progetto, milestone, link allo staging, fatture. È la feature che più fa dire
  "questi sono seri" — ed è anche la più costosa. Da fare dopo le altre.

---

## 4. Struttura della navigazione

☑ La navbar è ferma a **quattro voci** e non deve crescere: appena si scorre
collassa a `max-w-2xl`, e ogni voce in più la stringe fino a spezzarla.

    Servizi ▾        Cosa facciamo · Come lavoriamo · Prezzi
    Lavori           → /work
    Risorse ▾        Analisi gratuita · Blog
    Chi siamo        → /team

Regola per il futuro: **una pagina nuova entra come voce di un gruppo, non come
voce della barra.** Le pagine per servizio (§2) vanno sotto *Servizi*, `/lab`
(§3) sotto *Risorse*, "Come lavoriamo" (§2) sotto *Chi siamo* quando diventerà
una pagina vera invece di un'ancora. Da telefono i gruppi diventano
intestazioni dentro il pannello: niente tendine dentro tendine.

Il footer elenca tutte le pagine principali, riusando le etichette di `nav` così
barra e footer non possono divergere.

## 5. Debito e correzioni note

- ☑ `app/sitemap.ts` non includeva `/work` né `/team` in `STATIC_PATHS`: le index
  page di lavori e team non finivano in sitemap (ci finivano solo i singoli slug
  di `/work`). Aggiunte insieme a `/analisi`.
- ☑ Il `<html>` non dichiarava `data-scroll-behavior="smooth"`: con
  `scroll-behavior: smooth` in `globals.css`, Next applicava lo scorrimento
  morbido anche ai cambi di pagina, che devono invece partire dall'alto e basta.
- ☑ Nessuna analytics nel progetto. `@vercel/analytics` + Speed Insights ora
  montati in `app/layout.tsx`, con eventi custom (`track()`) su CTA verticali,
  form di richiamata e preventivatore.
- ☑ `siteConfig.whatsapp`/`siteConfig.phone` sono già numeri reali (verificato
  settembre 2026, non più placeholder).
