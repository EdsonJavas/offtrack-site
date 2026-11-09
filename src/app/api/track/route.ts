import { getProducts } from "@/lib/catalog";
import {
  METRIC_EVENTS,
  metricsEnabled,
  recordEvent,
  type MetricEvent,
} from "@/lib/metrics";

const MAX_IDS = 30;
const BOTS = /bot|crawl|spider|preview|headless|lighthouse/i;

/** Sempre 204: quem chama é um beacon, não espera resposta nem pode vazar nada. */
const done = () => new Response(null, { status: 204 });

/**
 * Recebe um evento de uso da loja ({ e: evento, ids: peças }) e soma nas
 * contagens. Só aceita chamadas do próprio site, eventos conhecidos e ids de
 * peças que existem; robôs não contam.
 */
export async function POST(request: Request) {
  if (!metricsEnabled()) return done();
  if (BOTS.test(request.headers.get("user-agent") ?? "")) return done();

  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return done();

  let body: unknown;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return done();
  }
  const { e, ids } = (body ?? {}) as { e?: unknown; ids?: unknown };
  if (!METRIC_EVENTS.includes(e as MetricEvent) || !Array.isArray(ids)) {
    return done();
  }

  const known = new Set((await getProducts()).map((p) => p.id));
  const valid = [...new Set(ids)]
    .filter((id): id is string => typeof id === "string" && known.has(id))
    .slice(0, MAX_IDS);

  try {
    await recordEvent(e as MetricEvent, valid);
  } catch {
    // Medição nunca pode quebrar a loja.
  }
  return done();
}
