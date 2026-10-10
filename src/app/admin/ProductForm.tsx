"use client";

import { useActionState, useCallback, useRef, useState } from "react";
import Link from "next/link";
import {
  CATEGORIES,
  CATEGORY_KIND,
  MEASURES_BY_KIND,
  MEASURE_LABELS,
  type Product,
  type ProductCategory,
} from "@/data/types";
import { formatPrice, parsePrice } from "@/lib/format";
import { Star } from "@/components/ui/Star";
import { saveProductAction, type ActionState } from "./actions";
import { ImageEditor } from "./ImageEditor";
import admin from "./admin.module.css";
import styles from "./ProductForm.module.css";

interface VariantDraft {
  color: string;
  hex: string;
  /** URL já salva (ou vazio para foto nova). */
  image: string;
  /** O que aparece na prévia: a URL salva ou o arquivo escolhido/editado. */
  preview: string;
}

/** Tons mais comuns das peças; o dono também pode digitar um hex. */
const PALETTE: [string, string][] = [
  ["Preto", "#141414"],
  ["Chumbo", "#3a3a3a"],
  ["Cinza", "#8a8a8a"],
  ["Branco", "#f4f4f2"],
  ["Off-white", "#e8e4d8"],
  ["Areia", "#d9cbb3"],
  ["Bege", "#c8b89a"],
  ["Marrom", "#5c3b2e"],
  ["Verde-oliva", "#556b2f"],
  ["Marinho", "#1f2a44"],
  ["Vinho", "#5e1f2a"],
  ["Vermelho", "#a1282a"],
];

const SIZES_TOP = ["PP", "P", "M", "G", "GG", "XGG"];
const SIZES_BOTTOM = ["36", "38", "40", "42", "44", "46", "48"];

const BADGES: Array<[Product["badge"] | "", string]> = [
  ["", "Sem selo"],
  ["Novo", "Novo"],
  ["Destaque", "Destaque"],
];

const emptyVariant = (): VariantDraft => ({
  color: "",
  hex: "#141414",
  image: "",
  preview: "",
});

interface EditorTarget {
  index: number;
  source: File | string;
  fileName: string;
}

/**
 * Ficha da peça: formulário em estações numeradas, com a prévia do card
 * (igual ao da loja) atualizando ao vivo ao lado.
 */
export function ProductForm({ product }: { product: Product | null }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    saveProductAction,
    {},
  );

  const [name, setName] = useState(product?.name ?? "");
  const [category, setCategory] = useState<ProductCategory>(
    product?.category ?? "Camiseta",
  );
  const [price, setPrice] = useState(
    product ? (product.priceCents / 100).toFixed(2).replace(".", ",") : "",
  );
  const [badge, setBadge] = useState<Product["badge"] | "">(
    product?.badge ?? "",
  );
  const [sizes, setSizes] = useState<string[]>(
    product?.sizes ?? ["P", "M", "G", "GG"],
  );
  const [customSize, setCustomSize] = useState("");
  const [available, setAvailable] = useState(product?.available ?? true);
  const [variants, setVariants] = useState<VariantDraft[]>(
    product?.variants.map((v) => ({
      color: v.color,
      hex: v.hex,
      image: v.image,
      preview: v.image,
    })) ?? [emptyVariant()],
  );
  const [activeVariant, setActiveVariant] = useState(0);
  const [editor, setEditor] = useState<EditorTarget | null>(null);
  const fileInputs = useRef<(HTMLInputElement | null)[]>([]);

  const kind = CATEGORY_KIND[category];
  const measureKeys = MEASURES_BY_KIND[kind];
  const sizePresets =
    kind === "shorts" || kind === "pants" ? SIZES_BOTTOM : SIZES_TOP;
  const priceCents = parsePrice(price);

  const updateVariant = (i: number, patch: Partial<VariantDraft>) =>
    setVariants((v) =>
      v.map((item, j) => (j === i ? { ...item, ...patch } : item)),
    );

  const toggleSize = (s: string) =>
    setSizes((list) =>
      list.includes(s) ? list.filter((x) => x !== s) : [...list, s],
    );

  const addCustomSize = () => {
    const s = customSize.trim().toUpperCase();
    if (s && !sizes.includes(s)) setSizes((list) => [...list, s]);
    setCustomSize("");
  };

  /** Foto escolhida no seletor: abre o editor na hora. */
  const onFileChosen = (i: number, file: File | undefined) => {
    if (!file) return;
    // Prévia com o arquivo cru desde já; se ele cancelar o editor, a foto fica assim.
    updateVariant(i, { preview: URL.createObjectURL(file) });
    setEditor({ index: i, source: file, fileName: file.name });
  };

  /** Editar o que já está no campo (arquivo novo) ou a foto salva (URL). */
  const openEditor = (i: number) => {
    const input = fileInputs.current[i];
    const file = input?.files?.[0];
    const v = variants[i];
    if (file) setEditor({ index: i, source: file, fileName: file.name });
    else if (v.image)
      setEditor({ index: i, source: v.image, fileName: `${v.color || "foto"}.jpg` });
  };

  const closeEditor = useCallback(() => setEditor(null), []);

  /** Foto editada entra no campo de arquivo (vai no envio) e na prévia. */
  const onEdited = useCallback(
    (file: File, previewUrl: string) => {
      if (!editor) return;
      const input = fileInputs.current[editor.index];
      if (input) {
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
      }
      setVariants((v) =>
        v.map((item, j) =>
          j === editor.index ? { ...item, preview: previewUrl } : item,
        ),
      );
      setEditor(null);
    },
    [editor],
  );

  const removeVariant = (i: number) => {
    setVariants((list) => list.filter((_, j) => j !== i));
    fileInputs.current.splice(i, 1);
    setActiveVariant((a) => Math.max(0, Math.min(a, variants.length - 2)));
  };

  const preview = variants[Math.min(activeVariant, variants.length - 1)];

  return (
    <form action={action} className={styles.form}>
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="badge" value={badge} />
      <input type="hidden" name="sizes" value={sizes.join(", ")} />

      {/* ---- Cabeçalho ---- */}
      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow}>
            <Link href="/admin">← Peças</Link>
          </p>
          <h1 className={styles.title}>
            {product ? "Editar peça" : "Nova peça"}
            <span className={styles.stamp} aria-hidden="true">
              OT.
            </span>
          </h1>
        </div>
        <p className={styles.lead}>
          Preencha as estações. A prévia mostra o card como ele vai aparecer
          na loja, atualizando enquanto você digita.
        </p>
      </header>

      <div className={styles.layout}>
        <div className={styles.stations}>
          {/* ---- 01 A peça ---- */}
          <section className={styles.station}>
            <header className={styles.stationHead}>
              <span className={styles.stationNumber}>01</span>
              <h2 className={styles.stationTitle}>A peça</h2>
            </header>

            <label className={styles.big}>
              <span className={styles.label}>Nome da peça</span>
              <input
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Tee Essential"
                required
                className={styles.bigInput}
                autoComplete="off"
              />
            </label>

            <div className={styles.group}>
              <span className={styles.label}>Categoria</span>
              <div className={styles.chips} role="radiogroup">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={c === category}
                    className={`${styles.chip} ${c === category ? styles.chipOn : ""}`}
                    onClick={() => setCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.row2}>
              <label className={styles.group}>
                <span className={styles.label}>Preço</span>
                <span className={styles.priceField}>
                  <span className={styles.prefix}>R$</span>
                  <input
                    name="price"
                    inputMode="decimal"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="89,90"
                    required
                    className={styles.priceInput}
                  />
                </span>
                <span className={styles.helpSmall}>
                  Entrada de 80%:{" "}
                  <strong>{formatPrice(Math.round(priceCents * 0.8))}</strong>
                </span>
              </label>

              <div className={styles.group}>
                <span className={styles.label}>Selo no card</span>
                <div className={styles.chips} role="radiogroup">
                  {BADGES.map(([value, label]) => (
                    <button
                      key={label}
                      type="button"
                      role="radio"
                      aria-checked={badge === value}
                      className={`${styles.chip} ${badge === value ? styles.chipOn : ""}`}
                      onClick={() => setBadge(value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <label className={styles.group}>
              <span className={styles.label}>Descrição curta</span>
              <textarea
                name="description"
                rows={2}
                defaultValue={product?.description}
                placeholder="Uma ou duas frases: caimento, ocasião, detalhe que importa."
                className={styles.input}
              />
            </label>

            <div className={styles.row3}>
              <label className={styles.group}>
                <span className={styles.label}>Modelagem</span>
                <input
                  name="fit"
                  defaultValue={product?.fit}
                  placeholder="Oversized, ombro caído"
                  className={styles.input}
                />
              </label>
              <label className={styles.group}>
                <span className={styles.label}>Tecido</span>
                <input
                  name="fabric"
                  defaultValue={product?.fabric}
                  placeholder="Algodão 100%, 240 g/m²"
                  className={styles.input}
                />
              </label>
              <label className={styles.group}>
                <span className={styles.label}>Código interno</span>
                <input
                  name="sku"
                  defaultValue={product?.sku}
                  placeholder="OT-TEE-001"
                  className={styles.input}
                />
              </label>
            </div>
          </section>

          {/* ---- 02 Cores e fotos ---- */}
          <section className={styles.station}>
            <header className={styles.stationHead}>
              <span className={styles.stationNumber}>02</span>
              <h2 className={styles.stationTitle}>Cores e fotos</h2>
              <p className={styles.stationHelp}>
                Uma foto por cor, da peça em si. Ao escolher, o editor abre
                para enquadrar no formato do card.
              </p>
            </header>

            <div className={styles.variants}>
              {variants.map((v, i) => (
                <div
                  key={i}
                  className={`${styles.variant} ${i === activeVariant ? styles.variantOn : ""}`}
                  onFocusCapture={() => setActiveVariant(i)}
                  onClick={() => setActiveVariant(i)}
                >
                  <span className={styles.variantIndex}>
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* Foto: azulejo clicável que abre o seletor; depois, editar/trocar. */}
                  <div className={styles.photo}>
                    <input
                      ref={(el) => {
                        fileInputs.current[i] = el;
                      }}
                      type="file"
                      name={`variant[${i}][file]`}
                      accept="image/*"
                      className={styles.fileInput}
                      onChange={(e) => onFileChosen(i, e.target.files?.[0])}
                    />
                    <input type="hidden" name={`variant[${i}][image]`} value={v.image} />
                    <input type="hidden" name={`variant[${i}][position]`} value="50% 50%" />
                    {v.preview ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element -- object URL local */}
                        <img src={v.preview} alt="" className={styles.photoImg} />
                        <div className={styles.photoActions}>
                          <button
                            type="button"
                            className={styles.photoButton}
                            onClick={() => openEditor(i)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className={styles.photoButton}
                            onClick={() => fileInputs.current[i]?.click()}
                          >
                            Trocar
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        type="button"
                        className={styles.photoEmpty}
                        onClick={() => fileInputs.current[i]?.click()}
                      >
                        <span className={styles.photoPlus}>+</span>
                        <span>Escolher foto</span>
                        <span className={styles.photoHint}>JPG ou PNG · até 8 MB</span>
                      </button>
                    )}
                  </div>

                  <div className={styles.variantFields}>
                    <label className={styles.group}>
                      <span className={styles.label}>Nome da cor</span>
                      <input
                        name={`variant[${i}][color]`}
                        value={v.color}
                        onChange={(e) => updateVariant(i, { color: e.target.value })}
                        placeholder="Preto"
                        className={styles.input}
                        autoComplete="off"
                      />
                    </label>

                    <div className={styles.group}>
                      <span className={styles.label}>
                        Tom <em className={styles.labelValue}>{v.hex}</em>
                      </span>
                      <input type="hidden" name={`variant[${i}][hex]`} value={v.hex} />
                      <div className={styles.palette}>
                        {PALETTE.map(([label, hex]) => (
                          <button
                            key={hex}
                            type="button"
                            title={label}
                            aria-label={label}
                            aria-pressed={v.hex === hex}
                            className={`${styles.swatch} ${v.hex === hex ? styles.swatchOn : ""}`}
                            style={{ "--swatch": hex } as React.CSSProperties}
                            onClick={() =>
                              updateVariant(i, {
                                hex,
                                color: v.color || label,
                              })
                            }
                          />
                        ))}
                        <label className={styles.customSwatch} title="Outro tom">
                          <input
                            type="color"
                            value={v.hex}
                            onChange={(e) => updateVariant(i, { hex: e.target.value })}
                            aria-label="Escolher outro tom"
                          />
                          <span style={{ "--swatch": v.hex } as React.CSSProperties} />
                          <span>Outro</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {variants.length > 1 && (
                    <button
                      type="button"
                      className={styles.remove}
                      onClick={() => removeVariant(i)}
                      aria-label="Remover esta cor"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {variants.length < 8 && (
              <button
                type="button"
                className={styles.addVariant}
                onClick={() => {
                  setVariants((v) => [...v, emptyVariant()]);
                  setActiveVariant(variants.length);
                }}
              >
                <span>+</span> Outra cor
              </button>
            )}
          </section>

          {/* ---- 03 Tamanhos e medidas ---- */}
          <section className={styles.station}>
            <header className={styles.stationHead}>
              <span className={styles.stationNumber}>03</span>
              <h2 className={styles.stationTitle}>Tamanhos e medidas</h2>
              <p className={styles.stationHelp}>
                Toque nos tamanhos disponíveis. As medidas (cm, peça esticada)
                aparecem na etiqueta; deixe em branco o que não souber.
              </p>
            </header>

            <div className={styles.group}>
              <span className={styles.label}>Tamanhos</span>
              <div className={styles.chips}>
                {[...new Set([...sizePresets, ...sizes])].map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={sizes.includes(s)}
                    className={`${styles.chip} ${styles.chipSize} ${sizes.includes(s) ? styles.chipOn : ""}`}
                    onClick={() => toggleSize(s)}
                  >
                    {s}
                  </button>
                ))}
                <span className={styles.customSize}>
                  <input
                    value={customSize}
                    onChange={(e) => setCustomSize(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomSize();
                      }
                    }}
                    placeholder="Outro"
                    aria-label="Outro tamanho"
                    className={styles.customSizeInput}
                  />
                  <button type="button" onClick={addCustomSize} aria-label="Adicionar tamanho">
                    +
                  </button>
                </span>
              </div>
            </div>

            {sizes.length > 0 && (
              <div className={styles.measures}>
                <div
                  className={styles.measuresGrid}
                  style={{ "--cols": measureKeys.length } as React.CSSProperties}
                >
                  <span className={styles.measuresHead}>Tam.</span>
                  {measureKeys.map((k) => (
                    <span key={k} className={styles.measuresHead}>
                      {MEASURE_LABELS[k]}
                    </span>
                  ))}
                  {sizes.map((size) => (
                    <div key={size} className={styles.measuresRow}>
                      <span className={styles.measuresSize}>{size}</span>
                      {measureKeys.map((k) => (
                        <label key={k} className={styles.measure}>
                          <input
                            name={`measure[${size}][${k}]`}
                            inputMode="decimal"
                            defaultValue={product?.measurements[size]?.[k] ?? ""}
                            placeholder="—"
                          />
                          <span>cm</span>
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ---- 04 Publicar ---- */}
          <section className={styles.station}>
            <header className={styles.stationHead}>
              <span className={styles.stationNumber}>04</span>
              <h2 className={styles.stationTitle}>Publicar</h2>
            </header>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                name="available"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
              />
              <span className={styles.toggleTrack} aria-hidden="true">
                <span className={styles.toggleKnob} />
              </span>
              <span className={styles.toggleText}>
                <strong>{available ? "Visível na loja" : "Oculta na loja"}</strong>
                <span>
                  {available
                    ? "A peça entra na Seleção assim que você salvar."
                    : "Fica guardada no painel; ninguém vê no site."}
                </span>
              </span>
            </label>
          </section>
        </div>

        {/* ---- Prévia ao vivo ---- */}
        <aside className={styles.previewCol}>
          <div className={styles.previewSticky}>
            <p className={styles.previewLabel}>
              <Star size={9} /> Prévia · como fica na loja
            </p>
            <div className={styles.card}>
              <div className={styles.cardMedia}>
                {preview?.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element -- object URL local
                  <img src={preview.preview} alt="" className={styles.cardPhoto} />
                ) : (
                  <div className={styles.cardNoPhoto}>
                    <span>Sem foto</span>
                  </div>
                )}
                <div className={styles.cardTop}>
                  <span className={styles.cardCategory}>{category}</span>
                  {badge && <span className={styles.cardBadge}>{badge}</span>}
                </div>
                <div className={styles.cardPrice}>
                  <span>Sob encomenda</span>
                  <strong>{priceCents > 0 ? formatPrice(priceCents) : "R$ —"}</strong>
                </div>
              </div>
              <div className={styles.cardBody}>
                <p className={styles.cardName}>{name || "Nome da peça"}</p>
                <div className={styles.cardRow}>
                  <span>Cor</span>
                  <div className={styles.cardSwatches}>
                    {variants.map((v, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={v.color || `Cor ${i + 1}`}
                        aria-pressed={i === activeVariant}
                        className={`${styles.cardSwatch} ${i === activeVariant ? styles.cardSwatchOn : ""}`}
                        style={{ "--swatch": v.hex } as React.CSSProperties}
                        onClick={() => setActiveVariant(i)}
                      />
                    ))}
                  </div>
                  <em>{preview?.color || "—"}</em>
                </div>
                <div className={styles.cardRow}>
                  <span>Tam.</span>
                  <div className={styles.cardSizes}>
                    {sizes.length > 0 ? (
                      sizes.map((s) => <span key={s}>{s}</span>)
                    ) : (
                      <em>escolha os tamanhos</em>
                    )}
                  </div>
                </div>
                <div className={styles.cardAdd}>
                  Adicionar ao carrinho <span>+</span>
                </div>
              </div>
            </div>
            <p className={styles.previewNote}>
              {available ? "Vai aparecer na Seleção." : "Oculta: só você vê."}
            </p>
          </div>
        </aside>
      </div>

      {/* ---- Barra fixa ---- */}
      <div className={styles.bar}>
        {state.error ? (
          <p className={styles.barError}>{state.error}</p>
        ) : (
          <p className={styles.barInfo}>
            {variants.filter((v) => v.preview).length}/{variants.length} fotos ·{" "}
            {sizes.length} tamanhos
          </p>
        )}
        <div className={styles.barActions}>
          <Link href="/admin" className={admin.ghost}>
            Cancelar
          </Link>
          <button type="submit" className={styles.save} disabled={pending}>
            {pending ? "Salvando…" : product ? "Salvar alterações" : "Publicar peça"}
            <Star size={10} />
          </button>
        </div>
      </div>

      {editor && (
        <ImageEditor
          key={`${editor.index}-${editor.fileName}`}
          source={editor.source}
          fileName={editor.fileName}
          onCancel={closeEditor}
          onSave={onEdited}
        />
      )}
    </form>
  );
}
