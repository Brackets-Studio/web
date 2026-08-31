import { cache } from "react";
import { sanityFetch } from "./client";
import { PRICING_SETTINGS_QUERY } from "./queries";
import type { PricingSettings } from "./types";

/**
 * Avvolto in `cache()` perché lo stesso documento serve sia a `/pricing`
 * (card + preventivatore) sia a `/servizi/[slug]` (teaser prezzo) nello
 * stesso render: senza, la query partirebbe due volte per richiesta.
 */
export const getPricingSettings = cache(async (locale: string) =>
  sanityFetch<PricingSettings | null>({
    query: PRICING_SETTINGS_QUERY,
    params: { locale },
    tags: ["pricingSettings"],
  }),
);
