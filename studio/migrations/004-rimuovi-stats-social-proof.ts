import { getCliClient } from "sanity/cli";

/**
 * Una tantum: rimuove `stats` da `socialProof` — il campo è stato tolto dallo
 * schema (niente numeri sotto i loghi, solo il marquee). Non tocca `logos`
 * né `heading`.
 *
 *   npx sanity exec migrations/004-rimuovi-stats-social-proof.ts --with-user-token
 */

async function run() {
  const client = getCliClient().withConfig({ apiVersion: "2026-08-01" });
  await client.patch("socialProof").unset(["stats"]).commit();
  console.log("✓ Campo \"stats\" rimosso da socialProof.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
