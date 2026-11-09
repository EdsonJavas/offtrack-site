import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/adminAuth";
import { getStore, usesBlobStorage } from "@/lib/catalog";
import { AdminNav } from "../AdminNav";
import { StoreForm } from "./StoreForm";
import styles from "../admin.module.css";

export const metadata = {
  title: "Loja · Painel",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

/** Dados da loja que só o dono sabe: contato, identificação legal e políticas. */
export default async function StorePage() {
  if (!(await isAuthenticated())) redirect("/admin");
  const store = await getStore();

  return (
    <main className={styles.shell}>
      <AdminNav current="loja" title="Loja" />
      <StoreForm store={store} readOnly={!usesBlobStorage()} />
    </main>
  );
}
