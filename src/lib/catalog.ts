import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { unstable_cache, updateTag } from "next/cache";
import { seedProducts } from "@/data/seed-products";
import type { Catalog, Product } from "@/data/types";

/**
 * Onde o catálogo vive:
 * - Produção (Vercel): Vercel Blob, com `BLOB_READ_WRITE_TOKEN` no projeto.
 * - Local (sem token): `content/products.json` e fotos em `public/uploads/`.
 * Sem nada salvo ainda, vale o catálogo de exemplo (`example: true`).
 *
 * No Blob cada salvamento vira um arquivo NOVO (`catalog/products-<carimbo>.json`):
 * a CDN guarda cada URL por um mês, então sobrescrever o mesmo arquivo deixava
 * o site lendo a versão velha. Lê-se sempre o mais recente; os antigos são apagados.
 */
const CATALOG_PREFIX = "catalog/products-";
const LEGACY_PATH = "catalog/products.json";
const KEEP_VERSIONS = 3;
const LOCAL_FILE = path.join(process.cwd(), "content", "products.json");
const LOCAL_UPLOADS = path.join(process.cwd(), "public", "uploads");
const TAG = "catalog";

const hasBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

/** Produção (Blob): o painel sobe as fotos direto do navegador. */
export const usesBlobStorage = hasBlob;

/** Último salvamento nesta instância: cobre o intervalo até o `list` refletir. */
let lastWrite: { pathname: string; catalog: Catalog } | null = null;

const versionPath = () =>
  `${CATALOG_PREFIX}${String(Date.now()).padStart(15, "0")}.json`;

async function readCatalog(): Promise<Catalog | null> {
  if (hasBlob()) {
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

  try {
    return JSON.parse(await fs.readFile(LOCAL_FILE, "utf8")) as Catalog;
  } catch {
    return null;
  }
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

async function writeCatalog(catalog: Catalog) {
  if (hasBlob()) {
    await writeBlobVersion(catalog);
  } else {
    await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
    await fs.writeFile(LOCAL_FILE, JSON.stringify(catalog, null, 2), "utf8");
  }
  // Quem salva vê o resultado na hora (sem servir cache velho enquanto revalida).
  updateTag(TAG);
}

const loadProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const catalog = await readCatalog();
    return catalog?.products ?? seedProducts;
  },
  ["catalog"],
  { tags: [TAG] },
);

/** Todas as peças cadastradas (ou o exemplo), para o painel. */
export const getAllProducts = loadProducts;

/** Só as peças visíveis no site. */
export async function getProducts(): Promise<Product[]> {
  return (await loadProducts()).filter((p) => p.available);
}

/** Verdadeiro enquanto o site ainda mostra alguma peça de exemplo. */
export async function isExampleCatalog(): Promise<boolean> {
  const catalog = await readCatalog();
  return catalog === null || catalog.products.some((p) => p.example);
}

/**
 * Lista sobre a qual uma edição/exclusão acontece. Sem catálogo salvo, os
 * exemplos passam a valer como peças de verdade (ficam salvos com `example`),
 * para que o dono possa editar ou excluir um a um.
 */
async function editableProducts(): Promise<Product[]> {
  return (await readCatalog())?.products ?? seedProducts;
}

export async function saveProduct(product: Product) {
  const catalog = await readCatalog();
  const current = catalog?.products ?? seedProducts;
  const index = current.findIndex((p) => p.id === product.id);
  // Primeira peça real num catálogo ainda sem nada salvo: os exemplos somem.
  const next =
    index === -1
      ? [product, ...(catalog ? current : [])]
      : current.map((p) => (p.id === product.id ? product : p));
  await writeCatalog({ version: 1, products: next });
}

export async function deleteProduct(id: string) {
  const current = await editableProducts();
  await writeCatalog({
    version: 1,
    products: current.filter((p) => p.id !== id),
  });
}

/** Remove todas as peças de exemplo de uma vez. */
export async function deleteExamples() {
  const current = await editableProducts();
  await writeCatalog({
    version: 1,
    products: current.filter((p) => !p.example),
  });
}

/** Salva uma foto e devolve a URL pública. */
export async function saveImage(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  if (hasBlob()) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`fotos/${name}`, file, {
      access: "public",
      addRandomSuffix: false,
    });
    return blob.url;
  }

  await fs.mkdir(LOCAL_UPLOADS, { recursive: true });
  await fs.writeFile(
    path.join(LOCAL_UPLOADS, name),
    Buffer.from(await file.arrayBuffer()),
  );
  return `/uploads/${name}`;
}
