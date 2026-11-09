import Link from "next/link";
import { adminConfigured, isAuthenticated } from "@/lib/adminAuth";
import { getAllProducts, usesBlobStorage } from "@/lib/catalog";
import { AdminNav } from "./AdminNav";
import { LoginForm } from "./LoginForm";
import { ProductList } from "./ProductList";
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

  const [products, params] = await Promise.all([
    getAllProducts(),
    searchParams,
  ]);
  // Sem o token do Blob, este ambiente só espelha a produção.
  const readOnly = !usesBlobStorage();

  return (
    <main className={styles.shell}>
      <AdminNav
        current="pecas"
        title="Peças"
        action={
          !readOnly && (
            <Link href="/admin/produto/novo" className={styles.primary}>
              + Nova peça
            </Link>
          )
        }
      />

      {params.salvo && (
        <p className={styles.success}>Peça salva. O site já está atualizado.</p>
      )}

      {readOnly && (
        <p className={styles.notice}>
          <strong>Modo leitura.</strong> Este ambiente mostra as peças
          publicadas em produção, mas não grava. Para cadastrar ou editar, use
          o painel do site publicado, ou coloque o{" "}
          <code>BLOB_READ_WRITE_TOKEN</code> no <code>.env.local</code>.
        </p>
      )}

      {products.length === 0 ? (
        <p className={styles.notice}>
          Nenhuma peça cadastrada ainda.
          {!readOnly && " Comece por “+ Nova peça”."}
        </p>
      ) : (
        <ProductList products={products} readOnly={readOnly} />
      )}
    </main>
  );
}
