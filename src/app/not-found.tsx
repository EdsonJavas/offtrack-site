import Link from "next/link";
import { brand } from "@/data/brand";
import styles from "./not-found.module.css";

export const metadata = { title: "Página não encontrada" };

export default function NotFound() {
  return (
    <main className={styles.main}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>Fora da pista, fora do mapa.</h1>
      <p className={styles.text}>
        Essa página não existe. As peças estão na seleção.
      </p>
      <Link href="/#selecao" className={styles.link}>
        Ver peças da {brand.name}
      </Link>
    </main>
  );
}
