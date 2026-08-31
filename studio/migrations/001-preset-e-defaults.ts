import type {SanityClient} from 'sanity'

/**
 * Migrazione una tantum delle landing verticali.
 *
 * Si esegue dalla cartella `studio/`:
 *
 *   npx sanity exec migrations/001-preset-e-defaults.ts --with-user-token
 *
 * (`--with-user-token` usa le credenziali con cui sei già loggato: non serve
 * creare un token di scrittura.)
 *
 * Fa tre cose, in UNA sola transazione — o passano tutte o non passa niente,
 * così non esiste un istante in cui una landing è senza prezzo:
 *
 * 1. Crea "Impostazioni verticali" (`verticalDefaults`) con ciò che era
 *    duplicato identico tra Ristoranti e B&B: prezzo, CTA finale, etichette.
 * 2. Imposta `theme.preset` sulle due verticali e cancella i vecchi campi
 *    `theme.pattern` / `theme.patternColor`, che lo schema non ha più.
 * 3. Toglie dalle due verticali il prezzo e la CTA finale duplicati, così da lì
 *    in poi li ereditano dal singleton: cambiare il listino torna a essere una
 *    modifica sola invece di sette.
 *
 * Restano invece sui documenti, come override voluti: `about` (cambia parola per
 * ogni settore) e `objections` (una delle tre è specifica della nicchia).
 *
 * Idempotente: rieseguirla ricrea lo stesso stato senza duplicare niente.
 */

const DEFAULTS_ID = 'verticalDefaults'

/** Il prezzo, identico sui due documenti: da qui in avanti sta in un posto solo. */
const price = {
  title: 'Quanto costa',
  oneTime: {
    label: "Oppure, tutto in un'unica soluzione",
    amount: '600€',
    includes: 'Primo anno di gestione incluso.',
    features: [
      'Il sito, con tutto quello che i tuoi clienti cercano',
      'Lo cambi tu, quando vuoi, dal telefono',
      'Dominio, hosting e un anno di aiuto compresi',
    ],
  },
  installments: {
    label: 'Il modo più semplice: a rate',
    amount: '50€ al mese, per 12 mesi',
    note: "Stessa cifra di sopra, pagata un po' alla volta. Nessuna sorpresa.",
  },
}

const verticalDefaults = {
  _id: DEFAULTS_ID,
  _type: 'verticalDefaults',
  contact: {
    ctaLabel: 'Chiamami ora',
    ctaWhatsappLabel: 'Scrivimi su WhatsApp',
    callbackTitle: 'Preferisci che ti chiami io?',
    callbackText: 'Lasciami nome e numero. Ti richiamo io, quando ti fa comodo.',
  },
  // Le tre voci sotto l'hero. Non sono promesse nuove: riprendono quanto è già
  // scritto nelle obiezioni e nel prezzo delle landing pubblicate.
  trust: {
    items: [
      {_key: 'tuo', title: 'Il sito è tuo', text: 'Dominio e pannello intestati a te, dal primo giorno.'},
      {_key: 'aggiorni', title: 'Lo aggiorni tu', text: 'Dal telefono, in due minuti. Ti faccio vedere come.'},
      {_key: 'compreso', title: 'Tutto compreso', text: "Dominio, hosting e un anno di assistenza nel prezzo."},
    ],
  },
  price,
  // Le due obiezioni che arrivano su ogni nicchia. La terza è specifica del
  // settore e resta sul singolo documento.
  objections: {
    title: 'Le domande che mi fanno tutti',
    items: [
      {
        _key: 'computer',
        fear: 'Non sono capace con il computer.',
        answer:
          'Nessun problema. Te lo faccio vedere io, ci vogliono dieci minuti. Dopo, per te sarà facile.',
      },
      {
        _key: 'dipendenza',
        fear: 'E se poi devo dipendere sempre da te?',
        answer:
          'No. Il sito è tuo fin dal primo giorno: dominio e pannello sono intestati a te, non a me.',
      },
    ],
  },
  about: {
    text: 'Sono di Pesaro. Faccio siti per le attività della zona. Se hai un dubbio, chiamami: ne parliamo a voce.',
  },
  closingCta: {
    title: 'Parliamone',
    text: 'Una chiamata veloce, senza impegno. Ti spiego tutto a voce.',
  },
  // Erano scritte nel codice della pagina: qui si cambiano senza un deploy.
  sectionLabels: {
    proof: 'Lavori veri',
    benefits: 'Perché conviene',
    process: 'Come funziona',
    price: 'Quanto costa',
    cases: 'Un esempio vero',
    objections: 'Domande frequenti',
    about: 'Chi sono',
  },
}

/** Quale preset va su quale verticale. Le nuove si impostano dallo Studio. */
const PRESET_BY_SLUG: Record<string, string> = {
  ristoranti: 'ristorazione',
  bnb: 'ospitalita',
}

export default async function migrate(client: SanityClient) {
  const verticals = await client.fetch<{_id: string; slug: string}[]>(
    `*[_type == "vertical" && defined(slug.current)]{_id, "slug": slug.current}`,
  )

  const tx = client.transaction()

  // `createOrReplace` rende la migrazione rieseguibile: la seconda volta
  // riscrive gli stessi valori invece di fallire su un documento esistente.
  tx.createOrReplace(verticalDefaults)

  for (const {_id, slug} of verticals) {
    const preset = PRESET_BY_SLUG[slug]
    if (!preset) {
      console.warn(`· ${slug}: nessun preset previsto, lo imposterai dallo Studio.`)
      continue
    }

    tx.patch(_id, (patch) =>
      patch
        .set({'theme.preset': preset})
        .unset([
          // Campi rimossi dallo schema.
          'theme.pattern',
          'theme.patternColor',
          // Ora ereditati dal singleton: lasciarli qui significherebbe
          // continuare a mantenerli in due posti.
          'price',
          'closingCta',
          'hero.ctaLabel',
          'hero.ctaWhatsappLabel',
        ]),
    )

    console.log(`· ${slug} → preset "${preset}", prezzo e CTA ereditati dal singleton`)
  }

  await tx.commit()
  console.log(`\n✓ Migrazione completata su ${verticals.length} verticali.`)
}
