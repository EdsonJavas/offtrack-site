import Link from "next/link";
import { brand } from "@/data/brand";
import { logoutAction } from "./actions";
import styles from "./admin.module.css";

type Section = "pecas" | "desempenho" | "loja";

const LINKS: { key: Section; href: string; label: string }[] = [
  { key: "pecas", href: "/admin", label: "Peças" },
  { key: "desempenho", href: "/admin/desempenho", label: "Desempenho" },
  { key: "loja", href: "/admin/loja", label: "Loja" },
];

/** Cabeçalho comum do painel: seções, link para o site e sair. */
export function AdminNav({
  current,
  title,
  action,
}: {
  current: Section;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <header className={styles.head}>
      <div>
        <p className={styles.eyebrow}>{brand.name} · Painel</p>
        <h1 className={styles.title}>{title}</h1>
      </div>
      <nav className={styles.sections} aria-label="Seções do painel">
        {LINKS.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            className={`${styles.section} ${link.key === current ? styles.sectionOn : ""}`}
            aria-current={link.key === current ? "page" : undefined}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className={styles.headActions}>
        <Link href="/" className={styles.ghost} target="_blank">
          Ver o site
        </Link>
        <form action={logoutAction}>
          <button type="submit" className={styles.ghost}>
            Sair
          </button>
        </form>
        {action}
      </div>
    </header>
  );
}
