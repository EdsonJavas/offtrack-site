import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { unstable_cache, revalidateTag } from "next/cache";
import { seedProducts } from "@/data/seed-products";
import type { Catalog, Product } from "@/data/types";

/**
 * Onde o catálogo vive:
 * - Produção (Vercel): Vercel Blob, com `BLOB_READ_WRITE_TOKEN` no projeto.
 * - Local (sem token): `content/products.json` e fotos em `public/uploads/`.
 * Sem nada salvo ainda, vale o catálogo de exemplo (`example: true`).
 */
const CATALOG_PATH = "catalog/products.json";
const LOCAL_FILE = path.join(process.cwd(), "content", "products.json");
const LOCAL_UPLOADS = path.join(process.cwd(), "public", "uploads");
const TAG = "catalog";

const hasBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

/** Produção (Blob): o painel sobe as fotos direto do navegador. */
export const usesBlobStorage = hasBlob;

async function readCatalog(): Promise<Catalog | null> {
  if (hasBlob()) {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: CATALOG_PATH, limit: 1 });
    const blob = blobs.find((b) => b.pathname === CATALOG_PATH);
    if (!blob) return null;
    const res = await fetch(blob.url, { cache: "no-store" });
    return res.ok ? ((await res.json()) as Catalog) : null;
  }

  try {
    return JSON.parse(await fs.readFile(LOCAL_FILE, "utf8")) as Catalog;
  } catch {
    return null;
  }
}

async function writeCatalog(catalog: Catalog) {
  const body = JSON.stringify(catalog, null, 2);
  if (hasBlob()) {
    const { put } = await import("@vercel/blob");
    await put(CATALOG_PATH, body, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
  } else {
    await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
    await fs.writeFile(LOCAL_FILE, body, "utf8");
  }
  revalidateTag(TAG, "max");
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
