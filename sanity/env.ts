export const apiVersion = "2026-08-01";

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "Missing environment variable: NEXT_PUBLIC_SANITY_DATASET"
);

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID"
);

// Anche la stringa vuota è un valore mancante: su Vercel una variabile
// incollata male esiste ma è vuota, supera un controllo su `undefined` e va a
// morire dentro createClient con "`projectId` can only contain only a-z, 0-9
// and dashes" — un messaggio che non nomina la variabile e manda a cercare il
// bug nel codice invece che nelle impostazioni del progetto.
function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined || (typeof v === "string" && v.trim() === "")) {
    throw new Error(errorMessage);
  }
  return v;
}
