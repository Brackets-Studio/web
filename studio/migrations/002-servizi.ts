import { getCliClient } from "sanity/cli";

/**
 * Crea i quattro documenti Servizio che prima erano hardcoded in
 * `messages/en.json` / `messages/it.json` (`services.items.*`), ora rimossi
 * da lì: il contenuto vive solo qui.
 *
 * Si esegue dalla cartella `studio/`:
 *
 *   npx sanity exec migrations/002-servizi.ts --with-user-token
 *
 * `sanity exec` (a differenza di `sanity migration run`) esegue lo script
 * come un file Node qualsiasi: non chiama un export default con un client
 * pronto, va richiesto a mano con `getCliClient()`. Il codice gira quindi al
 * livello più alto del modulo, non dentro una funzione esportata.
 *
 * Riempie SOLO i campi italiani (`title.it`, `shortDescription.it`, ecc.):
 * `title.en`/`shortDescription.en`/i punti chiave in inglese restano vuoti,
 * da compilare a mano in Studio. Finché `title.en` manca, la validazione del
 * campo lo segnala in rosso — è voluto, è il promemoria di cosa manca ancora.
 *
 * Idempotente: rieseguirla riscrive lo stesso stato sugli stessi `_id`
 * (`createOrReplace`), senza duplicare documenti.
 */

type ServiceSeed = {
  id: string;
  slug: string;
  order: number;
  eyebrow: string;
  title: string;
  shortDescription: string;
  tags: string[];
  summary: string;
  highlights: string[];
};

const SERVICES: ServiceSeed[] = [
  {
    id: "service-web",
    slug: "web",
    order: 1,
    eyebrow: "Sviluppo web",
    title: "Siti e gestionali su misura",
    shortDescription: "Il sito della tua azienda e il programma con cui la gestisci.",
    tags: ["Next.js", "TypeScript", "PostgreSQL"],
    summary:
      "Costruiamo il sito della tua azienda e il gestionale con cui la mandi avanti: ordini, clienti, documenti, magazzino. Su misura, perché ogni azienda lavora a modo suo — e pensato per reggere anche quando cresci.",
    highlights: [
      "Un pannello dove trovi tutto, invece di dieci fogli Excel",
      "Si collega ai programmi che usi già",
      "Cresce con te, senza dover ricominciare da capo",
    ],
  },
  {
    id: "service-mobile",
    slug: "mobile",
    order: 2,
    eyebrow: "Sviluppo mobile",
    title: "App per cellulare",
    shortDescription: "App per iPhone e Android, per i tuoi clienti o per chi lavora con te.",
    tags: ["React Native", "Expo", "Swift"],
    summary:
      "Creiamo l'app della tua azienda, dalla prima idea fino alla pubblicazione su App Store e Play Store. Che serva ai tuoi clienti o alle persone che lavorano con te, la colleghiamo agli strumenti che usi già.",
    highlights: [
      "Una sola app che funziona su iPhone e Android",
      "Pubblicazione sugli store, ce ne occupiamo noi",
      "Collegata ai dati che hai già, senza doppi inserimenti",
    ],
  },
  {
    id: "service-ai",
    slug: "ai",
    order: 3,
    eyebrow: "Automazioni e AI",
    title: "Automazione e intelligenza artificiale",
    shortDescription: "Togliamo di mezzo il lavoro ripetitivo che ti porta via ore.",
    tags: ["Lettura documenti", "Assistenti AI", "Automazioni"],
    summary:
      "Ci sono lavori che ti portano via ore ogni settimana e che nessuno dovrebbe più fare a mano: ricopiare fatture, smistare email, aggiornare gli stessi dati in tre posti diversi. Quelli li automatizziamo.",
    highlights: [
      "Fatture e documenti letti e archiviati da soli",
      "Risposte e notifiche automatiche ai tuoi clienti",
      "Automazioni costruite sul modo in cui lavori tu",
    ],
  },
  {
    id: "service-cloud",
    slug: "cloud",
    order: 4,
    eyebrow: "Server e collegamenti",
    title: "Server, WhatsApp e collegamenti",
    shortDescription: "Tutto quello che sta dietro e deve funzionare senza che tu ci pensi.",
    tags: ["WhatsApp Business", "Telnyx", "AWS"],
    summary:
      "Il tuo sito o gestionale deve stare online e funzionare sempre, anche di domenica sera. Ce ne occupiamo noi: server, backup, controlli. E lo colleghiamo a WhatsApp Business o al centralino, se ti serve parlare coi clienti in automatico.",
    highlights: [
      "Messaggi e conferme automatiche su WhatsApp",
      "Server controllati, con backup e avvisi se qualcosa non va",
      "Nessuna manutenzione a carico tuo",
    ],
  },
];

async function run() {
  const client = getCliClient().withConfig({ apiVersion: "2026-08-01" });
  const tx = client.transaction();

  for (const service of SERVICES) {
    tx.createOrReplace({
      _id: service.id,
      _type: "service",
      title: { _type: "localeString", it: service.title },
      slug: { _type: "slug", current: service.slug },
      eyebrow: { _type: "localeString", it: service.eyebrow },
      shortDescription: { _type: "localeText", it: service.shortDescription },
      tags: service.tags.map((tag, i) => ({
        _type: "localeString",
        _key: `tag-${i}`,
        it: tag,
      })),
      detail: {
        _type: "object",
        summary: { _type: "localeText", it: service.summary },
        highlights: service.highlights.map((text, i) => ({
          _type: "localeString",
          _key: `highlight-${i}`,
          it: text,
        })),
      },
      order: service.order,
    });
    console.log(`· ${service.slug} → creato/aggiornato, solo campi IT compilati`);
  }

  await tx.commit();
  console.log(`\n✓ Migrazione completata: ${SERVICES.length} servizi.`);
  console.log(
    "  Da fare in Studio: title.en, shortDescription.en, tags EN, detail.summary/highlights EN, heroImage.",
  );
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
