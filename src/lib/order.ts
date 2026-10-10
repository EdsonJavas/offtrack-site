import { brand } from "@/data/brand";
import { formatPrice } from "@/lib/format";

export interface OrderLine {
  name: string;
  color: string;
  size: string;
  qty: number;
  /** Em centavos. */
  priceCents: number;
}

/** Mensagem pronta para o Direct/WhatsApp com as peças escolhidas. */
export function buildOrderMessage(lines: OrderLine[]): string {
  const items = lines
    .map(
      (l) =>
        `• ${l.qty}x ${l.name} — ${l.color}, tam. ${l.size} (${formatPrice(l.priceCents * l.qty)})`,
    )
    .join("\n");
  const total = lines.reduce((sum, l) => sum + l.priceCents * l.qty, 0);

  return [
    `Fala, ${brand.name}! Vim pelo site e quero encomendar:`,
    items,
    `Valor no site: ${formatPrice(total)} (a confirmar).`,
    "Pode confirmar disponibilidade e prazo?",
  ].join("\n");
}

export type SendResult = "whatsapp" | "copied" | "not-copied";

/**
 * Abre o canal de atendimento com o pedido.
 * WhatsApp (quando existir) recebe o texto pela URL. O Direct não aceita texto:
 * a mensagem é copiada ANTES de abrir a conversa (depois de trocar de aba a cópia
 * costuma falhar), e a janela abre no mesmo gesto do clique.
 */
export function sendOrder(message: string): Promise<SendResult> {
  if (brand.whatsapp) {
    window.open(
      `${brand.whatsapp.url}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
    return Promise.resolve("whatsapp");
  }

  // Inicia a cópia e abre a janela sem esperar: o `await` tiraria o gesto do usuário
  // e o navegador bloquearia o pop-up.
  const copy =
    navigator.clipboard?.writeText(message).then(
      () => true,
      () => false,
    ) ?? Promise.resolve(false);
  window.open(brand.instagram.direct, "_blank", "noopener,noreferrer");
  return copy.then((ok) => (ok ? "copied" : "not-copied"));
}
