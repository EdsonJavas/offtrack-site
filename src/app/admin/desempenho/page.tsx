import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/adminAuth";
import { getAllProducts } from "@/lib/catalog";
import { metricsEnabled, readMetrics, type ProductMetrics } from "@/lib/metrics";
import { AdminNav } from "../AdminNav";
import admin from "../admin.module.css";
import styles from "./desempenho.module.css";

export const metadata = {
  title: "Desempenho · Painel",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const PERIODS = [7, 30, 90] as const;
const EMPTY: ProductMetrics = { view: 0, fav: 0, cart: 0, direct: 0 };

const pct = (part: number, whole: number) =>
  whole > 0 ? `${Math.round((part / whole) * 100)}%` : "—";

/**
 * O que as pessoas fazem com cada peça: abrem, favoritam, põem no carrinho,
 * mandam no pedido. Contagens agregadas, sem identificar ninguém.
 */
export default async function PerformancePage({
  searchParams,
}: {
  searchParams: Promise<{ dias?: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/admin");

  const { dias } = await searchParams;
  const days = (PERIODS as readonly number[]).includes(Number(dias))
    ? Number(dias)
    : 30;

  if (!metricsEnabled()) {
    return (
      <main className={admin.shell}>
        <AdminNav current="desempenho" title="Desempenho" />
        <section className={styles.setup}>
          <p className={styles.setupEyebrow}>Ainda não ligado</p>
          <h2 className={styles.setupTitle}>
            Falta um lugar para <span>guardar as contagens.</span>
          </h2>
          <p className={styles.setupText}>
            O site já está pronto para contar quantas vezes cada peça é aberta,
            favoritada, colocada no carrinho e enviada no pedido. Ele só precisa
            de um banco pequeno e gratuito na Vercel. É o mesmo caminho do
            armazenamento das fotos, feito uma vez:
          </p>
          <ol className={styles.steps}>
            <li>
              Na Vercel, abra o projeto → <strong>Storage</strong> →{" "}
              <strong>Create Database</strong>.
            </li>
            <li>
              Escolha <strong>Upstash</strong> → <strong>Redis</strong> (plano
              gratuito) e crie.
            </li>
            <li>
              Em <strong>Connect Project</strong>, ligue ao{" "}
              <code>offtrack-site</code>. As variáveis entram sozinhas.
            </li>
            <li>
              Faça um <strong>Redeploy</strong> em Deployments. Pronto: esta
              página passa a mostrar os números.
            </li>
          </ol>
          <p className={styles.setupNote}>
            Enquanto isso, nada se perde do lado da loja: as peças continuam
            funcionando normalmente, só não há contagem.
          </p>
        </section>
      </main>
    );
  }

  const [products, metrics] = await Promise.all([
    getAllProducts(),
    readMetrics(days),
  ]);

  const rows = products
    .map((product) => ({ product, m: metrics.get(product.id) ?? EMPTY }))
    .sort((a, b) => b.m.view - a.m.view || b.m.direct - a.m.direct);

  const total = rows.reduce<ProductMetrics>(
    (acc, { m }) => ({
      view: acc.view + m.view,
      fav: acc.fav + m.fav,
      cart: acc.cart + m.cart,
      direct: acc.direct + m.direct,
    }),
    { ...EMPTY },
  );

  return (
    <main className={admin.shell}>
      <AdminNav current="desempenho" title="Desempenho" />

      <div className={styles.toolbar}>
        <nav className={styles.periods} aria-label="Período">
          {PERIODS.map((p) => (
            <Link
              key={p}
              href={`/admin/desempenho?dias=${p}`}
              className={`${styles.period} ${p === days ? styles.periodOn : ""}`}
              aria-current={p === days ? "page" : undefined}
            >
              {p} dias
            </Link>
          ))}
        </nav>
        <p className={styles.legend}>
          Contagens de todo mundo que usou o site no período, sem identificar
          ninguém. “Aberta” conta uma vez por visita.
        </p>
      </div>

      <section className={styles.totals} aria-label="Totais do período">
        <Stat label="Peças abertas" value={total.view} />
        <Stat label="Favoritadas" value={total.fav} />
        <Stat label="No carrinho" value={total.cart} />
        <Stat
          label="Enviadas no pedido"
          value={total.direct}
          note={`${pct(total.direct, total.view)} das aberturas`}
          highlight
        />
      </section>

      {rows.length === 0 ? (
        <p className={admin.notice}>Nenhuma peça cadastrada ainda.</p>
      ) : (
        <ol className={styles.rows}>
          {rows.map(({ product, m }, index) => (
            <li
              key={product.id}
              className={`${styles.row} ${product.available ? "" : styles.rowOff}`}
            >
              <span className={styles.rank}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className={styles.thumb}>
                <Image
                  src={product.variants[0].image}
                  alt=""
                  fill
                  sizes="72px"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className={styles.who}>
                <p className={styles.name}>{product.name}</p>
                <p className={styles.meta}>
                  {product.category}
                  {!product.available && (
                    <span className={admin.tag}>oculta</span>
                  )}
                </p>
              </div>
              <dl className={styles.counts}>
                <div>
                  <dt>Aberta</dt>
                  <dd>{m.view}</dd>
                </div>
                <div>
                  <dt>Favoritos</dt>
                  <dd>{m.fav}</dd>
                </div>
                <div>
                  <dt>Carrinho</dt>
                  <dd>{m.cart}</dd>
                </div>
                <div className={styles.countMain}>
                  <dt>Pedidos</dt>
                  <dd>
                    {m.direct}
                    <small>{pct(m.direct, m.view)}</small>
                  </dd>
                </div>
              </dl>
              <div className={styles.bar} aria-hidden="true">
                <span
                  style={{
                    width: `${total.view ? Math.max(2, (m.view / Math.max(1, rows[0].m.view)) * 100) : 0}%`,
                  }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}

function Stat({
  label,
  value,
  note,
  highlight,
}: {
  label: string;
  value: number;
  note?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`${styles.stat} ${highlight ? styles.statMain : ""}`}>
      <span className={styles.statLabel}>{label}</span>
      <strong className={styles.statValue}>{value}</strong>
      {note && <span className={styles.statNote}>{note}</span>}
    </div>
  );
}
