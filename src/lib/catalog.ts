import "server-only";
import { unstable_cache, updateTag } from "next/cache";
import type { Catalog, Product } from "@/data/types";

/**
 * O catálogo tem uma fonte só: o Vercel Blob de produção. Não há peças de
 * exemplo nem catálogo local.
 *
 * - Com `BLOB_READ_WRITE_TOKEN` (Vercel, ou `.env.local` com o token): lê e grava
 *   direto no Blob.
 * - Sem token, com `CATALOG_URL` (desenvolvimento): espelho somente leitura do que
 *   está publicado, lido da rota pública `/api/catalog` do site em produção.
 * - Sem nenhum dos dois: catálogo vazio.
 *
 * No Blob cada salvamento vira um arquivo NOVO (`catalog/products-<carimbo>.json`):
 * a CDN guarda cada URL por um mês, então sobrescrever o mesmo arquivo deixava
 * o site lendo a versão velha. Lê-se sempre o mais recente; os antigos são apagados.
 */
const CATALOG_PREFIX = "catalog/products-";
const LEGACY_PATH = "catalog/products.json";
const KEEP_VERSIONS = 3;
const TAG = "catalog";

const hasBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

/** Verdadeiro quando este ambiente pode gravar (tem o token do Blob). */
export const usesBlobStorage = hasBlob;

/** Último salvamento nesta instância: cobre o intervalo até o `list` refletir. */
let lastWrite: { pathname: string; catalog: Catalog } | null = null;

const versionPath = () =>
  `${CATALOG_PREFIX}${String(Date.now()).padStart(15, "0")}.json`;

/**
 * Catálogos antigos podem ter peças de exemplo gravadas (`example: true`, de
 * quando o site nascia com mocks). Elas nunca mais aparecem e somem de vez no
 * próximo salvamento.
 */
const isReal = (p: Product) => !(p as Product & { example?: boolean }).example;

async function readBlobCatalog(): Promise<Catalog | null> {
  const { list } = await import("@vercel/blob");
  const { blobs } = await list({ prefix: CATALOG_PREFIX, limit: 1000 });
  // Carimbo zero-preenchido no nome: ordem alfabética = ordem no tempo.
  const latest = [...blobs].sort((a, b) =>
    b.pathname.localeCompare(a.pathname),
  )[0];

  if (lastWrite && (!latest || lastWrite.pathname >= latest.pathname)) {
    return lastWrite.catalog;
  }
  if (latest) {
    const res = await fetch(latest.url, { cache: "no-store" });
    return res.ok ? ((await res.json()) as Catalog) : null;
  }

  // Migração: catálogo antigo num arquivo fixo (lido com cache-buster) vira a 1ª versão.
  const legacy = (await list({ prefix: LEGACY_PATH, limit: 1 })).blobs.find(
    (b) => b.pathname === LEGACY_PATH,
  );
  if (!legacy) return null;
  const res = await fetch(`${legacy.url}?v=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) return null;
  const catalog = (await res.json()) as Catalog;
  await writeBlobVersion(catalog);
  return catalog;
}

/** Espelho de produção para desenvolvimento sem token (somente leitura). */
async function readMirrorCatalog(): Promise<Catalog | null> {
  const url = process.env.CATALOG_URL;
  if (!url) return null;
  try {
    const res = await fetch(url, { cache: "no-store" });
    return res.ok ? ((await res.json()) as Catalog) : null;
  } catch {
    return null;
  }
}

async function readProducts(): Promise<Product[]> {
  const catalog = hasBlob()
    ? await readBlobCatalog()
    : await readMirrorCatalog();
  return (catalog?.products ?? []).filter(isReal);
}

async function writeBlobVersion(catalog: Catalog) {
  const { put, del, list } = await import("@vercel/blob");
  const pathname = versionPath();
  await put(pathname, JSON.stringify(catalog, null, 2), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
  });
  lastWrite = { pathname, catalog };

  // Limpeza (melhor esforço): mantém só as últimas versões.
  try {
    const { blobs } = await list({ prefix: CATALOG_PREFIX, limit: 1000 });
    const old = [...blobs]
      .sort((a, b) => b.pathname.localeCompare(a.pathname))
      .slice(KEEP_VERSIONS)
      .map((b) => b.url);
    if (old.length > 0) await del(old);
  } catch {
    // versões antigas sobrando não atrapalham
  }
}

async function writeCatalog(products: Product[]) {
  if (!hasBlob()) {
    throw new Error(
      "Catálogo somente leitura: defina BLOB_READ_WRITE_TOKEN para gravar.",
    );
  }
  await writeBlobVersion({ version: 1, products: products.filter(isReal) });
  // Quem salva vê o resultado na hora (sem servir cache velho enquanto revalida).
  updateTag(TAG);
}

const cachedProducts = unstable_cache(readProducts, ["catalog"], {
  tags: [TAG],
});

/**
 * Todas as peças cadastradas, para o painel. Com o Blob, o resultado fica em
 * cache até o próximo salvamento; no espelho, cada leitura busca a produção.
 */
export async function getAllProducts(): Promise<Product[]> {
  return hasBlob() ? cachedProducts() : readProducts();
}

/** Só as peças visíveis no site. */
export async function getProducts(): Promise<Product[]> {
  return (await getAllProducts()).filter((p) => p.available);
}

export async function saveProduct(product: Product) {
  const current = await readProducts();
  const exists = current.some((p) => p.id === product.id);
  await writeCatalog(
    exists
      ? current.map((p) => (p.id === product.id ? product : p))
      : [product, ...current],
  );
}

export async function deleteProduct(id: string) {
  const current = await readProducts();
  await writeCatalog(current.filter((p) => p.id !== id));
}

/** Salva uma foto no Blob e devolve a URL pública. */
export async function saveImage(file: File): Promise<string> {
  if (!hasBlob()) {
    throw new Error(
      "Sem armazenamento de fotos: defina BLOB_READ_WRITE_TOKEN para enviar.",
    );
  }
  const ext = (file.name.split(".").pop() || "jpg")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { put } = await import("@vercel/blob");
  const blob = await put(`fotos/${name}`, file, {
    access: "public",
    addRandomSuffix: false,
  });
  return blob.url;
}
