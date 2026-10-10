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
 * Copia a mensagem e abre o canal de atendimento.
 * O Direct não aceita texto pela URL; o WhatsApp aceita, quando existir.
 * Devolve true se conseguiu copiar.
 */
export async function sendOrder(message: string): Promise<boolean> {
  if (brand.whatsapp) {
    window.open(`${brand.whatsapp.url}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    return false;
  }

  let copied = false;
  try {
    await navigator.clipboard.writeText(message);
    copied = true;
  } catch {
    // Sem clipboard (http ou permissão negada): só abre o Instagram.
  }
  window.open(brand.instagram.url, "_blank", "noopener,noreferrer");
  return copied;
}
