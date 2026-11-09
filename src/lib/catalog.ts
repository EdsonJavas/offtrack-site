import "server-only";
import { unstable_cache, updateTag } from "next/cache";
import type { Catalog, Product, StoreSettings } from "@/data/types";

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

/** Catálogo como o resto do app enxerga: peças reais + dados da loja. */
interface CatalogData {
  products: Product[];
  store: StoreSettings;
}

async function readData(): Promise<CatalogData> {
  const catalog = hasBlob()
    ? await readBlobCatalog()
    : await readMirrorCatalog();
  return {
    products: (catalog?.products ?? []).filter(isReal),
    store: catalog?.store ?? {},
  };
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

async function writeData(data: CatalogData) {
  if (!hasBlob()) {
    throw new Error(
      "Catálogo somente leitura: defina BLOB_READ_WRITE_TOKEN para gravar.",
    );
  }
  await writeBlobVersion({
    version: 1,
    products: data.products.filter(isReal),
    store: data.store,
  });
  // Quem salva vê o resultado na hora (sem servir cache velho enquanto revalida).
  updateTag(TAG);
}

// Chave nova ("catalog-v2"): o formato em cache mudou de lista para { products, store }.
const cachedData = unstable_cache(readData, ["catalog-v2"], { tags: [TAG] });

/** Com o Blob, fica em cache até o próximo salvamento; no espelho, lê a produção a cada vez. */
const getData = () => (hasBlob() ? cachedData() : readData());

/** Todas as peças cadastradas (inclusive ocultas), na ordem da vitrine. */
export async function getAllProducts(): Promise<Product[]> {
  return (await getData()).products;
}

/** Só as peças visíveis no site. */
export async function getProducts(): Promise<Product[]> {
  return (await getAllProducts()).filter((p) => p.available);
}

/** Uma peça visível, pelo id (página própria da peça). */
export async function getProduct(id: string): Promise<Product | null> {
  return (await getProducts()).find((p) => p.id === id) ?? null;
}

/** Dados da loja preenchidos pelo dono (contato, identificação, políticas). */
export async function getStore(): Promise<StoreSettings> {
  return (await getData()).store;
}

export async function saveProduct(product: Product) {
  const data = await readData();
  const exists = data.products.some((p) => p.id === product.id);
  await writeData({
    ...data,
    products: exists
      ? data.products.map((p) => (p.id === product.id ? product : p))
      : [product, ...data.products],
  });
}

export async function deleteProduct(id: string) {
  const data = await readData();
  await writeData({
    ...data,
    products: data.products.filter((p) => p.id !== id),
  });
}

/**
 * Nova ordem da vitrine. Ids desconhecidos são ignorados e peças que não
 * vieram na lista (cadastradas no meio do caminho) vão para o fim.
 */
export async function reorderProducts(ids: string[]) {
  const data = await readData();
  const byId = new Map(data.products.map((p) => [p.id, p]));
  const ordered = ids.flatMap((id) => {
    const product = byId.get(id);
    if (!product) return [];
    byId.delete(id);
    return [product];
  });
  await writeData({ ...data, products: [...ordered, ...byId.values()] });
}

export async function saveStore(store: StoreSettings) {
  const data = await readData();
  await writeData({ ...data, store });
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
