import Link from "next/link";
import Image from "next/image";
import { adminConfigured, isAuthenticated } from "@/lib/adminAuth";
import { getAllProducts, isExampleCatalog } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { brand } from "@/data/brand";
import { LoginForm } from "./LoginForm";
import {
  deleteExamplesAction,
  deleteProductAction,
  logoutAction,
  toggleAvailableAction,
} from "./actions";
import styles from "./admin.module.css";

export const metadata = {
  title: "Painel",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ salvo?: string }>;
}) {
  if (!adminConfigured()) {
    return (
      <main className={styles.shell}>
        <p className={styles.notice}>
          O painel está desligado. Defina <code>ADMIN_PASSWORD</code> e{" "}
          <code>ADMIN_SECRET</code> nas variáveis de ambiente (Vercel → Settings
          → Environment Variables) e faça um novo deploy.
        </p>
      </main>
    );
  }

  if (!(await isAuthenticated())) {
    return (
      <main className={styles.shell}>
        <LoginForm />
      </main>
    );
  }

  const [products, example, params] = await Promise.all([
    getAllProducts(),
    isExampleCatalog(),
    searchParams,
  ]);

  return (
    <main className={styles.shell}>
      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow}>{brand.name} · Painel</p>
          <h1 className={styles.title}>Peças</h1>
        </div>
        <div className={styles.headActions}>
          <Link href="/" className={styles.ghost} target="_blank">
            Ver o site
          </Link>
          <form action={logoutAction}>
            <button type="submit" className={styles.ghost}>
              Sair
            </button>
          </form>
          <Link href="/admin/produto/novo" className={styles.primary}>
            + Nova peça
          </Link>
        </div>
      </header>

      {params.salvo && (
        <p className={styles.success}>Peça salva. O site já está atualizado.</p>
      )}

      {example && (
        <div className={`${styles.notice} ${styles.noticeRow}`}>
          <p>
            O site está mostrando <strong>peças de exemplo</strong> (fotos de
            banco, preços fictícios). Você pode editar cada uma, excluir uma a
            uma ou apagar todas de uma vez.
          </p>
          <form action={deleteExamplesAction}>
            <button type="submit" className={styles.danger}>
              Excluir todos os exemplos
            </button>
          </form>
        </div>
      )}

      <ul className={styles.list}>
        {products.map((p) => (
          <li
            key={p.id}
            className={`${styles.item} ${p.available ? "" : styles.itemOff}`}
          >
            <div className={styles.thumb}>
              <Image
                src={p.variants[0].image}
                alt=""
                fill
                sizes="80px"
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className={styles.itemBody}>
              <p className={styles.itemMeta}>
                {p.category} · {p.variants.map((v) => v.color).join(", ")} ·{" "}
                {p.sizes.join(" ")}
                {p.example && <span className={styles.tag}>exemplo</span>}
                {!p.available && <span className={styles.tag}>oculta</span>}
              </p>
              <p className={styles.itemName}>{p.name}</p>
              <p className={styles.itemPrice}>{formatPrice(p.priceCents)}</p>
            </div>
            <div className={styles.itemActions}>
              <Link href={`/admin/produto/${p.id}`} className={styles.ghost}>
                Editar
              </Link>
              <form action={toggleAvailableAction}>
                <input type="hidden" name="id" value={p.id} />
                <button type="submit" className={styles.ghost}>
                  {p.available ? "Ocultar" : "Mostrar"}
                </button>
              </form>
              <form action={deleteProductAction}>
                <input type="hidden" name="id" value={p.id} />
                <button type="submit" className={styles.danger}>
                  Excluir
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
