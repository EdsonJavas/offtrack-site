import { notFound, redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/adminAuth";
import { getAllProducts } from "@/lib/catalog";
import { ProductForm } from "../../ProductForm";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

export default async function ProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/admin");

  const { id } = await params;
  const product =
    id === "novo"
      ? null
      : (await getAllProducts()).find((p) => p.id === id && !p.example);
  if (id !== "novo" && !product) notFound();

  return (
    <main className={styles.shell}>
      <ProductForm product={product ?? null} />
    </main>
  );
}
