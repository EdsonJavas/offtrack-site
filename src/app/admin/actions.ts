"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { destroySession, isAuthenticated } from "@/lib/adminAuth";
import {
  deleteProduct,
  getAllProducts,
  reorderProducts,
  saveImage,
  saveProduct,
  saveStore,
  usesBlobStorage,
} from "@/lib/catalog";
import { parsePrice } from "@/lib/format";
import {
  CATEGORIES,
  STORE_FIELDS,
  measuresFor,
  type MeasureKey,
  type Product,
  type ProductCategory,
  type StoreSettings,
} from "@/data/types";

export interface ActionState {
  error?: string;
  ok?: boolean;
}

// O login vive em app/admin/login/route.ts (fetch), para a animação de entrada.

export async function logoutAction() {
  await destroySession();
  redirect("/admin");
}

async function requireAuth() {
  if (!(await isAuthenticated())) redirect("/admin");
}

/** Sem o token do Blob o ambiente só espelha a produção: nada é gravado. */
const READ_ONLY =
  "Este ambiente está em modo leitura (sem BLOB_READ_WRITE_TOKEN). Edite pelo painel do site publicado.";

function slug(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Lê o formulário da peça e salva (fotos novas vão para o storage). */
export async function saveProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();
  if (!usesBlobStorage()) return { error: READ_ONLY };

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "") as ProductCategory;
  if (!name) return { error: "Dê um nome à peça." };
  if (!CATEGORIES.includes(category)) return { error: "Escolha a categoria." };

  const priceCents = parsePrice(String(formData.get("price") ?? ""));
  if (priceCents <= 0) return { error: "Informe o preço." };
  // Preço antigo ("de"): só vale quando é maior que o atual.
  const compareAtCents = parsePrice(String(formData.get("compareAt") ?? ""));

  const sizes = String(formData.get("sizes") ?? "")
    .split(/[,\s]+/)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  if (sizes.length === 0)
    return { error: "Informe ao menos um tamanho (ex.: P, M, G)." };

  // Variantes: cor + foto. A foto pode ser um arquivo novo ou a URL já salva.
  const variants: Product["variants"] = [];
  for (let i = 0; i < 8; i++) {
    const color = String(formData.get(`variant[${i}][color]`) ?? "").trim();
    if (!color) continue;
    const hex = String(formData.get(`variant[${i}][hex]`) ?? "#141414");
    const existing = String(formData.get(`variant[${i}][image]`) ?? "");
    const file = formData.get(`variant[${i}][file]`);
    const position = String(
      formData.get(`variant[${i}][position]`) ?? "50% 50%",
    );
    let image = existing;
    if (file instanceof File && file.size > 0) {
      if (file.size > 8 * 1024 * 1024)
        return { error: `A foto de "${color}" passa de 8 MB.` };
      image = await saveImage(file);
    }
    if (!image) return { error: `A cor "${color}" precisa de uma foto.` };

    // Galeria: URLs mantidas + arquivos novos (já editados no painel).
    let kept: string[] = [];
    try {
      const parsed: unknown = JSON.parse(
        String(formData.get(`variant[${i}][images]`) || "[]"),
      );
      if (Array.isArray(parsed))
        kept = parsed.filter((u): u is string => typeof u === "string" && !!u);
    } catch {
      kept = [];
    }
    const extras: string[] = [...kept];
    for (const extra of formData.getAll(`variant[${i}][extraFiles]`)) {
      if (!(extra instanceof File) || extra.size === 0) continue;
      if (extra.size > 8 * 1024 * 1024)
        return { error: `Uma foto extra de "${color}" passa de 8 MB.` };
      extras.push(await saveImage(extra));
    }

    // Tamanhos só desta cor (opcional) e os que estão esgotados.
    const sizeList = (field: string) =>
      String(formData.get(`variant[${i}][${field}]`) ?? "")
        .split(/[,\s]+/)
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);
    const variantSizes = sizeList("sizes");
    const effectiveSizes = variantSizes.length > 0 ? variantSizes : sizes;
    const soldOut = sizeList("soldOut").filter((s) => effectiveSizes.includes(s));

    variants.push({
      color,
      hex,
      image,
      position,
      ...(extras.length > 0 ? { images: extras } : {}),
      ...(variantSizes.length > 0 ? { sizes: variantSizes } : {}),
      ...(soldOut.length > 0 ? { soldOut } : {}),
    });
  }
  if (variants.length === 0)
    return { error: "Cadastre ao menos uma cor com foto." };

  // Medidas por tamanho (os da peça + os próprios de cada cor), só as da silhueta.
  const keys: MeasureKey[] = measuresFor(category);
  const measurements: Product["measurements"] = {};
  const allSizes = [...new Set([...sizes, ...variants.flatMap((v) => v.sizes ?? [])])];
  for (const size of allSizes) {
    const entry: Partial<Record<MeasureKey, number>> = {};
    for (const key of keys) {
      const value = Number(
        String(formData.get(`measure[${size}][${key}]`) ?? "").replace(
          ",",
          ".",
        ),
      );
      if (Number.isFinite(value) && value > 0) entry[key] = value;
    }
    if (Object.keys(entry).length > 0) measurements[size] = entry;
  }

  // Peças que nasceram da edição de um exemplo antigo ficaram com id "exemplo-NN"
  // (que vira o endereço público /peca/...). Na próxima gravação ganham um id
  // com o nome da peça; o antigo é apagado para não duplicar.
  const previousId = String(formData.get("id") ?? "");
  const legacy = /^exemplo-\d+$/.test(previousId);
  const id =
    previousId && !legacy
      ? previousId
      : `${slug(name)}-${Date.now().toString(36)}`;
  const badge = String(formData.get("badge") ?? "");

  const product: Product = {
    id,
    name,
    category,
    priceCents,
    ...(compareAtCents > priceCents ? { compareAtCents } : {}),
    variants,
    sizes,
    measurements,
    fit: String(formData.get("fit") ?? "").trim(),
    fabric: String(formData.get("fabric") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    badge: badge === "Novo" || badge === "Destaque" ? badge : undefined,
    sku: String(formData.get("sku") ?? "").trim() || undefined,
    available: formData.get("available") === "on",
    updatedAt: new Date().toISOString(),
  };

  await saveProduct(product);
  if (legacy) await deleteProduct(previousId);
  revalidatePath("/", "layout");
  revalidatePath("/admin");
  redirect("/admin?salvo=1");
}

/** Nova ordem da vitrine (lista de ids, do primeiro ao último). */
export async function reorderProductsAction(ids: string[]) {
  await requireAuth();
  if (!usesBlobStorage()) return;
  await reorderProducts(ids.filter((id) => typeof id === "string"));
  revalidatePath("/", "layout");
  revalidatePath("/admin");
}

/** Dados da loja (/admin/loja): contato, identificação e políticas. */
export async function saveStoreAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();
  if (!usesBlobStorage()) return { error: READ_ONLY };

  const text = (field: (typeof STORE_FIELDS)[number]) =>
    String(formData.get(field) ?? "").trim();

  const whatsappDigits = text("whatsapp").replace(/\D/g, "");
  if (whatsappDigits && (whatsappDigits.length < 12 || whatsappDigits.length > 13)) {
    return {
      error: "WhatsApp: use DDI + DDD + número, só dígitos (ex.: 5514999990000).",
    };
  }
  const email = text("email");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "E-mail inválido." };
  }

  const store: StoreSettings = {};
  for (const field of STORE_FIELDS) {
    const value = field === "whatsapp" ? whatsappDigits : text(field);
    if (value) store[field] = value;
  }

  await saveStore(store);
  revalidatePath("/", "layout");
  revalidatePath("/admin/loja");
  return { ok: true };
}

export async function toggleAvailableAction(formData: FormData) {
  await requireAuth();
  if (!usesBlobStorage()) return;
  const id = String(formData.get("id") ?? "");
  const product = (await getAllProducts()).find((p) => p.id === id);
  if (!product) return;
  await saveProduct({
    ...product,
    available: !product.available,
    updatedAt: new Date().toISOString(),
  });
  revalidatePath("/", "layout");
  revalidatePath("/admin");
}

export async function deleteProductAction(formData: FormData) {
  await requireAuth();
  if (!usesBlobStorage()) return;
  const id = String(formData.get("id") ?? "");
  await deleteProduct(id);
  revalidatePath("/", "layout");
  revalidatePath("/admin");
}
