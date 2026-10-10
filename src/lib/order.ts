import { brand } from "@/data/brand";
import { formatPrice } from "@/data/mock/products";

export interface OrderLine {
  name: string;
  color: string;
  size: string;
  qty: number;
  price: number;
}

/** Mensagem pronta para o Direct/WhatsApp com as peças escolhidas. */
export function buildOrderMessage(lines: OrderLine[]): string {
  const items = lines
    .map((l) => `• ${l.qty}x ${l.name} — ${l.color}, tam. ${l.size} (${formatPrice(l.price * l.qty)})`)
    .join("\n");
  const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);

  return [
    `Fala, ${brand.name}! Vim pelo site e quero encomendar:`,
    items,
    `Total: ${formatPrice(total)}`,
    "Como funciona o pedido?",
  ].join("\n");
}

/**
 * Abre o canal de atendimento com o pedido.
 * WhatsApp (quando existir) recebe o texto pela URL. O Direct não aceita texto:
 * abre a conversa (ig.me) e deixa a mensagem copiada para colar.
 * A janela abre ANTES de qualquer await: depois do await o navegador trata como pop-up.
 * Devolve true se a mensagem foi copiada.
 */
export async function sendOrder(message: string): Promise<boolean> {
  if (brand.whatsapp) {
    window.open(`${brand.whatsapp.url}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    return false;
  }

  window.open(brand.instagram.direct, "_blank", "noopener,noreferrer");

  try {
    await navigator.clipboard.writeText(message);
    return true;
  } catch {
    return false;
  }
}
