import "server-only";

/**
 * Contagens por peça (aberta, favoritada, no carrinho, enviada no pedido).
 *
 * Ficam num Redis acessado por REST (Upstash, criado pela Vercel em
 * Storage → Upstash for Redis, que injeta as variáveis sozinha). O Blob não
 * serve para isso: cada evento seria uma gravação e o plano tem cota mensal.
 *
 * Estrutura: um hash por dia, `ot:metrics:AAAA-MM-DD`, com campos
 * `<evento>:<id da peça>` → contagem. Nada de IP, cookie ou identificador de
 * pessoa. Os dias expiram sozinhos depois de RETENTION_DAYS.
 */
export const METRIC_EVENTS = ["view", "fav", "cart", "direct"] as const;
export type MetricEvent = (typeof METRIC_EVENTS)[number];
export type ProductMetrics = Record<MetricEvent, number>;

const KEY_PREFIX = "ot:metrics:";
const RETENTION_DAYS = 120;

function credentials(): { url: string; token: string } | null {
  const url =
    process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

/** Há um Redis configurado neste ambiente? */
export const metricsEnabled = () => credentials() !== null;

/** Vários comandos numa ida só (API REST do Upstash: POST /pipeline). */
async function pipeline(
  commands: (string | number)[][],
): Promise<unknown[]> {
  const creds = credentials();
  if (!creds || commands.length === 0) return [];
  const res = await fetch(`${creds.url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${creds.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redis respondeu ${res.status}`);
  const out = (await res.json()) as { result?: unknown }[];
  return out.map((entry) => entry.result);
}

/** Dia no fuso da loja (AAAA-MM-DD), para o "hoje" bater com o do dono. */
function dayKey(date: Date): string {
  const day = date.toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });
  return `${KEY_PREFIX}${day}`;
}

/** Soma 1 ao evento de cada peça, no dia de hoje. */
export async function recordEvent(event: MetricEvent, ids: string[]) {
  if (!metricsEnabled() || ids.length === 0) return;
  const key = dayKey(new Date());
  await pipeline([
    ...ids.map((id) => ["HINCRBY", key, `${event}:${id}`, 1]),
    ["EXPIRE", key, RETENTION_DAYS * 24 * 60 * 60],
  ]);
}

/** Totais por peça nos últimos `days` dias (hoje incluído). */
export async function readMetrics(
  days: number,
): Promise<Map<string, ProductMetrics>> {
  const totals = new Map<string, ProductMetrics>();
  if (!metricsEnabled()) return totals;

  const now = Date.now();
  const keys = Array.from({ length: days }, (_, i) =>
    dayKey(new Date(now - i * 24 * 60 * 60 * 1000)),
  );
  const results = await pipeline(keys.map((key) => ["HGETALL", key]));

  for (const result of results) {
    // HGETALL por REST devolve [campo, valor, campo, valor, ...].
    if (!Array.isArray(result)) continue;
    for (let i = 0; i + 1 < result.length; i += 2) {
      const [event, ...rest] = String(result[i]).split(":");
      const id = rest.join(":");
      const count = Number(result[i + 1]) || 0;
      if (!METRIC_EVENTS.includes(event as MetricEvent) || !id) continue;
      const entry =
        totals.get(id) ?? { view: 0, fav: 0, cart: 0, direct: 0 };
      entry[event as MetricEvent] += count;
      totals.set(id, entry);
    }
  }
  return totals;
}
