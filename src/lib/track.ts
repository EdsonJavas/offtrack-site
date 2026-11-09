/**
 * Medição de uso da loja, do lado do navegador. Manda só o evento e os ids das
 * peças para /api/track (contagem agregada, sem cookie nem identificador).
 *
 * - view:   peça aberta (etiqueta ou página própria); uma vez por sessão por peça
 * - fav:    peça favoritada
 * - cart:   peça adicionada ao carrinho
 * - direct: peça enviada num pedido (Direct ou WhatsApp)
 */
export type TrackEvent = "view" | "fav" | "cart" | "direct";

const SEEN_KEY = "offtrack-seen";

/** Ids já contados como "view" nesta sessão do navegador. */
function seenThisSession(id: string): boolean {
  try {
    const seen: string[] = JSON.parse(sessionStorage.getItem(SEEN_KEY) ?? "[]");
    if (seen.includes(id)) return true;
    sessionStorage.setItem(SEEN_KEY, JSON.stringify([...seen, id]));
    return false;
  } catch {
    return false;
  }
}

export function track(event: TrackEvent, ids: string | string[]) {
  if (typeof window === "undefined") return;
  let list = [...new Set(Array.isArray(ids) ? ids : [ids])].filter(Boolean);
  if (event === "view") list = list.filter((id) => !seenThisSession(id));
  if (list.length === 0) return;

  const body = JSON.stringify({ e: event, ids: list });
  try {
    // sendBeacon sobrevive à troca de aba (o pedido abre o Direct em outra janela).
    if (navigator.sendBeacon?.("/api/track", body)) return;
    void fetch("/api/track", { method: "POST", body, keepalive: true });
  } catch {
    // Medição nunca pode atrapalhar a compra.
  }
}
