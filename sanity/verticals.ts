import { cache } from "react";
import { sanityFetch } from "./client";
import { VERTICAL_BY_SLUG_QUERY } from "./queries";
import type { VerticalDetail } from "./types";

/**
 * Il documento di una landing verticale.
 *
 * Avvolto in `cache()` perché serve a due segmenti nello stesso render: il
 * layout (che ne ricava il preset del tema e i dati della chrome) e la pagina.
 * Senza, la stessa query partirebbe due volte per ogni richiesta.
 */
export const getVertical = cache(async (slug: string) =>
  sanityFetch<VerticalDetail | null>({
    query: VERTICAL_BY_SLUG_QUERY,
    params: { slug },
    tags: ["vertical"],
  }),
);
