"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  CATEGORIES,
  CATEGORY_KIND,
  MEASURES_BY_KIND,
  MEASURE_LABELS,
  type Product,
  type ProductCategory,
} from "@/data/types";
import { saveProductAction, type ActionState } from "./actions";
import styles from "./admin.module.css";

interface VariantDraft {
  color: string;
  hex: string;
  image: string;
  position: string;
}

const POSITIONS = [
  ["50% 50%", "Centro"],
  ["50% 30%", "Mais para cima"],
  ["50% 70%", "Mais para baixo"],
  ["50% 90%", "Pé da foto"],
] as const;

const emptyVariant = (): VariantDraft => ({
  color: "",
  hex: "#141414",
  image: "",
  position: "50% 50%",
});

/** Formulário de peça: dados, cores com foto e medidas por tamanho. */
export function ProductForm({ product }: { product: Product | null }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    saveProductAction,
    {},
  );
  const [category, setCategory] = useState<ProductCategory>(
    product?.category ?? "Camiseta",
  );
  const [sizesText, setSizesText] = useState(
    product?.sizes.join(", ") ?? "P, M, G, GG",
  );
  const [variants, setVariants] = useState<VariantDraft[]>(
    product?.variants.map((v) => ({
      ...v,
      position: v.position ?? "50% 50%",
    })) ?? [emptyVariant()],
  );

  const sizes = sizesText
    .split(/[,\s]+/)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  const measureKeys = MEASURES_BY_KIND[CATEGORY_KIND[category]];

  const updateVariant = (i: number, patch: Partial<VariantDraft>) =>
    setVariants((v) =>
      v.map((item, j) => (j === i ? { ...item, ...patch } : item)),
    );

  return (
    <form action={action} className={styles.form}>
      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow}>
            <Link href="/admin">← Peças</Link>
          </p>
          <h1 className={styles.title}>
            {product ? "Editar peça" : "Nova peça"}
          </h1>
        </div>
      </header>

      {product && <input type="hidden" name="id" value={product.id} />}

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Dados</h2>
        <div className={styles.grid2}>
          <label className={styles.field}>
            <span>Nome</span>
            <input
              name="name"
              defaultValue={product?.name}
              required
              placeholder="Ex.: Tee Essential"
            />
          </label>
          <label className={styles.field}>
            <span>Categoria</span>
            <select
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>Preço (R$)</span>
            <input
              name="price"
              inputMode="decimal"
              defaultValue={
                product
                  ? (product.priceCents / 100).toFixed(2).replace(".", ",")
                  : ""
              }
              required
              placeholder="89,90"
            />
          </label>
          <label className={styles.field}>
            <span>Tamanhos (separados por vírgula)</span>
            <input
              name="sizes"
              value={sizesText}
              onChange={(e) => setSizesText(e.target.value)}
              required
            />
          </label>
          <label className={styles.field}>
            <span>Modelagem</span>
            <input
              name="fit"
              defaultValue={product?.fit}
              placeholder="Ex.: Oversized, ombro caído"
            />
          </label>
          <label className={styles.field}>
            <span>Tecido</span>
            <input
              name="fabric"
              defaultValue={product?.fabric}
              placeholder="Ex.: Algodão 100%, 240 g/m²"
            />
          </label>
          <label className={styles.field}>
            <span>Selo</span>
            <select name="badge" defaultValue={product?.badge ?? ""}>
              <option value="">Nenhum</option>
              <option value="Novo">Novo</option>
              <option value="Destaque">Destaque</option>
            </select>
          </label>
          <label className={styles.field}>
            <span>Código interno (opcional)</span>
            <input
              name="sku"
              defaultValue={product?.sku}
              placeholder="Ex.: OT-TEE-001"
            />
          </label>
        </div>
        <label className={styles.field}>
          <span>Descrição curta</span>
          <textarea
            name="description"
            rows={3}
            defaultValue={product?.description}
          />
        </label>
        <label className={styles.check}>
          <input
            type="checkbox"
            name="available"
            defaultChecked={product?.available ?? true}
          />
          <span>Mostrar no site</span>
        </label>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Cores e fotos</h2>
        <p className={styles.help}>
          Uma foto por cor, da peça em si (frente), JPG ou PNG até 8 MB.
        </p>
        {variants.map((v, i) => (
          <div key={i} className={styles.variant}>
            <label className={styles.field}>
              <span>Cor</span>
              <input
                name={`variant[${i}][color]`}
                value={v.color}
                onChange={(e) => updateVariant(i, { color: e.target.value })}
                placeholder="Preto"
              />
            </label>
            <label className={styles.field}>
              <span>Tom</span>
              <input
                type="color"
                name={`variant[${i}][hex]`}
                value={v.hex}
                onChange={(e) => updateVariant(i, { hex: e.target.value })}
              />
            </label>
            <label className={styles.field}>
              <span>{v.image ? "Trocar foto" : "Foto"}</span>
              <input
                type="file"
                name={`variant[${i}][file]`}
                accept="image/*"
              />
              <input
                type="hidden"
                name={`variant[${i}][image]`}
                value={v.image}
              />
            </label>
            <label className={styles.field}>
              <span>Enquadramento</span>
              <select
                name={`variant[${i}][position]`}
                value={v.position}
                onChange={(e) => updateVariant(i, { position: e.target.value })}
              >
                {POSITIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            {v.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={v.image}
                alt=""
                className={styles.preview}
                style={{ objectPosition: v.position }}
              />
            )}
            {variants.length > 1 && (
              <button
                type="button"
                className={styles.danger}
                onClick={() =>
                  setVariants((list) => list.filter((_, j) => j !== i))
                }
              >
                Remover cor
              </button>
            )}
          </div>
        ))}
        {variants.length < 8 && (
          <button
            type="button"
            className={styles.ghost}
            onClick={() => setVariants((v) => [...v, emptyVariant()])}
          >
            + Outra cor
          </button>
        )}
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Medidas (cm)</h2>
        <p className={styles.help}>
          Peça esticada. Deixe em branco o que não souber.
        </p>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tam.</th>
                {measureKeys.map((k) => (
                  <th key={k}>{MEASURE_LABELS[k]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sizes.map((size) => (
                <tr key={size}>
                  <th>{size}</th>
                  {measureKeys.map((k) => (
                    <td key={k}>
                      <input
                        name={`measure[${size}][${k}]`}
                        inputMode="decimal"
                        defaultValue={product?.measurements[size]?.[k] ?? ""}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {state.error && <p className={styles.error}>{state.error}</p>}

      <div className={styles.formActions}>
        <Link href="/admin" className={styles.ghost}>
          Cancelar
        </Link>
        <button type="submit" className={styles.primary} disabled={pending}>
          {pending ? "Salvando…" : "Salvar peça"}
        </button>
      </div>
    </form>
  );
}
