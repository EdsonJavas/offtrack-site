import { NextResponse } from "next/server";
import { getProducts, getStore } from "@/lib/catalog";
import type { Catalog } from "@/data/types";

/**
 * Catálogo publicado, em JSON. É o mesmo conteúdo que a loja já mostra (as
 * peças visíveis e os dados de contato/identificação exibidos no site), exposto
 * para o ambiente de desenvolvimento espelhar a produção sem precisar do token
 * do Blob (`CATALOG_URL` no `.env.local`).
 */
export async function GET() {
  const [products, store] = await Promise.all([getProducts(), getStore()]);
  const catalog: Catalog = { version: 1, products, store };
  return NextResponse.json(catalog, {
    headers: { "Cache-Control": "no-store" },
  });
}
