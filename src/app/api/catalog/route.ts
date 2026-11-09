import { NextResponse } from "next/server";
import { getProducts } from "@/lib/catalog";
import type { Catalog } from "@/data/types";

/**
 * Catálogo publicado, em JSON. É o mesmo conteúdo que a loja já mostra (só as
 * peças visíveis), exposto para o ambiente de desenvolvimento espelhar a
 * produção sem precisar do token do Blob (`CATALOG_URL` no `.env.local`).
 */
export async function GET() {
  const catalog: Catalog = { version: 1, products: await getProducts() };
  return NextResponse.json(catalog, {
    headers: { "Cache-Control": "no-store" },
  });
}
