import type { ReactNode } from "react";
import Link from "next/link";
import styles from "./LegalPage.module.css";

interface LegalPageProps {
  title: string;
  updated: string;
  children: ReactNode;
}

export function LegalPage({ title, updated, children }: LegalPageProps) {
  return (
    <main className={styles.main}>
      <p className="eyebrow">Atualizado em {updated}</p>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.body}>{children}</div>
      <Link href="/" className={styles.back}>
        ← Voltar ao site
      </Link>
    </main>
  );
}
