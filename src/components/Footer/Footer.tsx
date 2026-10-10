import { brand } from "@/data/brand";
import { Star } from "@/components/ui/Star";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p className={styles.wordmark} aria-hidden="true">
          {brand.name}
        </p>

        <div className={styles.row}>
          <p className={styles.slogan}>
            <Star size={10} />
            {brand.slogan}
          </p>
          <p className={styles.meta}>
            {brand.city}, {brand.state} · © {brand.foundedYear} {brand.name}
          </p>
          <a
            href={brand.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.meta}
          >
            {brand.instagram.handle}
          </a>
        </div>
      </div>
    </footer>
  );
}
