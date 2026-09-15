import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";

// Sanity chiama questa route ad ogni publish, senza filtro di tipo
// (manage.sanity.io > API > Webhooks, trigger su tutti i documenti). Ogni
// query del sito usa `tags` senza `revalidate` numerico (sanity/client.ts) —
// quindi resta cachata a tempo indefinito finché il suo tag non viene
// invalidato qui. Provare a filtrare per `_type` è già andato storto una
// volta (la query "vertical" dipende anche da demo/caseStudy/
// verticalDefaults, non solo da "vertical"): più semplice e robusto
// invalidare tutti i tag ad ogni publish, qualunque sia il documento.
export const dynamic = "force-dynamic";

// Ogni tag passato a `tags: [...]` in una sanityFetch del sito — tenerla
// allineata è l'unico modo perché un tipo di contenuto nuovo diventi
// realtime: `grep -rn 'sanityFetch<' --include=*.ts --include=*.tsx .` e poi
// il `tags:` di ciascuna chiamata.
const ALL_TAGS = [
  "vertical",
  "caseStudy",
  "service",
  "pricingSettings",
  "post",
  "labItem",
  "testimonial",
  "socialProof",
];

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return new NextResponse(null, { status: 503 });
  }

  const { isValidSignature } = await parseBody(request, secret);
  if (!isValidSignature) {
    return new NextResponse(null, { status: 401 });
  }

  // { expire: 0 }, non "max": un webhook esterno deve invalidare subito, non
  // servire ancora stale-while-revalidate — vedi node_modules/next/dist/docs
  // .../revalidateTag.md, nota su "immediate expiration".
  for (const tag of ALL_TAGS) {
    revalidateTag(tag, { expire: 0 });
  }

  return NextResponse.json({ revalidated: true, tags: ALL_TAGS });
}
