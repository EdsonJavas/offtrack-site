"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { sizesOf, type Product, type ProductVariant } from "@/data/types";

export interface CartItem {
  /** productId + cor + tamanho. */
  key: string;
  productId: string;
  name: string;
  category: string;
  color: string;
  hex: string;
  image: string;
  position?: string;
  size: string;
  /** Em centavos. */
  priceCents: number;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  /** Em centavos. */
  subtotal: number;
  isOpen: boolean;
  toast: string | null;
  add: (product: Product, variant: ProductVariant, size: string) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/** Versão na chave: um carrinho antigo (preços em reais, mock) é descartado. */
const STORAGE_KEY = "offtrack-cart-v2";
const MAX_QTY = 10;
const TOAST_MS = 2200;

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.key === "string" &&
    typeof v.productId === "string" &&
    typeof v.size === "string" &&
    typeof v.priceCents === "number" &&
    typeof v.qty === "number"
  );
}

/**
 * Reconcilia o carrinho salvo com o catálogo atual: peça que sumiu sai,
 * preço/nome/foto são os de agora.
 */
function reconcile(items: CartItem[], catalog: Product[]): CartItem[] {
  return items.flatMap((item) => {
    const product = catalog.find((p) => p.id === item.productId);
    if (!product) return [];
    const variant =
      product.variants.find((v) => v.color === item.color) ??
      product.variants[0];
    if (!sizesOf(product, variant).includes(item.size)) return [];
    return [
      {
        ...item,
        name: product.name,
        category: product.category,
        color: variant.color,
        hex: variant.hex,
        image: variant.image,
        position: variant.position,
        priceCents: product.priceCents,
        qty: Math.min(item.qty, MAX_QTY),
      },
    ];
  });
}

export function CartProvider({
  catalog,
  children,
}: {
  catalog: Product[];
  children: ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Carrega do localStorage uma vez (fora do render, após a hidratação), depois salva a cada mudança.
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const saved: unknown = JSON.parse(
          localStorage.getItem(STORAGE_KEY) ?? "[]",
        );
        if (Array.isArray(saved))
          setItems(reconcile(saved.filter(isCartItem), catalog));
      } catch {
        // Storage indisponível ou corrompido: carrinho vazio.
      }
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, [catalog]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // idem
    }
  }, [items, hydrated]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  const add = useCallback(
    (product: Product, variant: ProductVariant, size: string) => {
      const key = `${product.id}|${variant.color}|${size}`;
      setItems((current) => {
        const existing = current.find((i) => i.key === key);
        if (existing) {
          return current.map((i) =>
            i.key === key ? { ...i, qty: Math.min(MAX_QTY, i.qty + 1) } : i,
          );
        }
        return [
          ...current,
          {
            key,
            productId: product.id,
            name: product.name,
            category: product.category,
            color: variant.color,
            hex: variant.hex,
            image: variant.image,
            position: variant.position,
            size,
            priceCents: product.priceCents,
            qty: 1,
          },
        ];
      });
      setToast(`${product.name} · ${variant.color} · ${size} no carrinho`);
    },
    [],
  );

  const remove = useCallback((key: string) => {
    setItems((current) => current.filter((i) => i.key !== key));
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setItems((current) =>
      qty <= 0
        ? current.filter((i) => i.key !== key)
        : current.map((i) =>
            i.key === key ? { ...i, qty: Math.min(MAX_QTY, qty) } : i,
          ),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: items.reduce((n, i) => n + i.qty * i.priceCents, 0),
      isOpen,
      toast,
      add,
      remove,
      setQty,
      clear,
      open,
      close,
    }),
    [items, isOpen, toast, add, remove, setQty, clear, open, close],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart precisa estar dentro de <CartProvider>");
  return ctx;
}
