"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { destroySession, isAuthenticated } from "@/lib/adminAuth";
import {
  deleteExamples,
  deleteProduct,
  getAllProducts,
  saveImage,
  saveProduct,
} from "@/lib/catalog";
import { parsePrice } from "@/lib/format";
import {
  CATEGORIES,
  CATEGORY_KIND,
  MEASURES_BY_KIND,
  type MeasureKey,
  type Product,
  type ProductCategory,
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

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "") as ProductCategory;
  if (!name) return { error: "Dê um nome à peça." };
  if (!CATEGORIES.includes(category)) return { error: "Escolha a categoria." };

  const priceCents = parsePrice(String(formData.get("price") ?? ""));
  if (priceCents <= 0) return { error: "Informe o preço." };

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

    variants.push({
      color,
      hex,
      image,
      position,
      ...(extras.length > 0 ? { images: extras } : {}),
    });
  }
  if (variants.length === 0)
    return { error: "Cadastre ao menos uma cor com foto." };

  // Medidas por tamanho, só as que fazem sentido para a silhueta.
  const keys: MeasureKey[] = MEASURES_BY_KIND[CATEGORY_KIND[category]];
  const measurements: Product["measurements"] = {};
  for (const size of sizes) {
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

  const id =
    String(formData.get("id") ?? "") ||
    `${slug(name)}-${Date.now().toString(36)}`;
  const badge = String(formData.get("badge") ?? "");

  const product: Product = {
    id,
    name,
    category,
    priceCents,
    variants,
    sizes,
    measurements,
    fit: String(formData.get("fit") ?? "").trim(),
    fabric: String(formData.get("fabric") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    badge: badge === "Novo" || badge === "Destaque" ? badge : undefined,
    sku: String(formData.get("sku") ?? "").trim() || undefined,
    available: formData.get("available") === "on",
    // Editar um exemplo o transforma em peça de verdade (o selo some).
    updatedAt: new Date().toISOString(),
  };

  await saveProduct(product);
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?salvo=1");
}

export async function toggleAvailableAction(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  const product = (await getAllProducts()).find((p) => p.id === id);
  if (!product) return;
  await saveProduct({
    ...product,
    available: !product.available,
    updatedAt: new Date().toISOString(),
  });
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteProductAction(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  await deleteProduct(id);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteExamplesAction() {
  await requireAuth();
  await deleteExamples();
  revalidatePath("/");
  revalidatePath("/admin");
}
