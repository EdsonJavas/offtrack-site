import { notFound, redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/adminAuth";
import { getAllProducts, usesBlobStorage } from "@/lib/catalog";
import { ProductForm } from "../../ProductForm";
import styles from "../../admin.module.css";

export const metadata = {
  title: "Peça · Painel",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function ProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/admin");
  // Modo leitura (sem token do Blob): não há o que editar por aqui. Em
  // desenvolvimento a ficha abre mesmo assim, para se trabalhar no desenho;
  // salvar devolve o aviso de modo leitura.
  if (!usesBlobStorage() && process.env.NODE_ENV === "production") {
    redirect("/admin");
  }

  const { id } = await params;
  const product =
    id === "novo"
      ? null
      : (await getAllProducts()).find((p) => p.id === id);
  if (id !== "novo" && !product) notFound();

  return (
    <main className={styles.shell}>
      <ProductForm product={product ?? null} uploadMode="blob" />
    </main>
  );
}
