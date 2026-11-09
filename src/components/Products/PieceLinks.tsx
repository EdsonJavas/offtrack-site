import Image from "next/image";
import Link from "next/link";
import { discountPercent, productSoldOut, type Product } from "@/data/types";
import { formatPrice } from "@/lib/format";
import styles from "./PieceLinks.module.css";

/**
 * "Outras peças" no fim da página de uma peça: quem chegou por um link direto
 * (story, WhatsApp) tem para onde ir sem precisar voltar à home.
 */
export function PieceLinks({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="outras-pecas">
      <header className={styles.head}>
        <h2 id="outras-pecas" className={styles.title}>
          Outras <span>peças.</span>
        </h2>
        <Link href="/#selecao" className={styles.all}>
          Ver toda a Seleção
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M4 12h16M13 5l7 7-7 7" />
          </svg>
        </Link>
      </header>

      <ul className={styles.grid}>
        {products.map((product) => {
          const variant = product.variants[0];
          const discount = discountPercent(product);
          return (
            <li key={product.id}>
              <Link href={`/peca/${product.id}`} className={styles.card}>
                <span className={styles.media}>
                  <Image
                    src={variant.image}
                    alt=""
                    fill
                    sizes="(min-width: 900px) 25vw, 50vw"
                    className={styles.photo}
                    style={{ objectPosition: variant.position ?? "50% 50%" }}
                  />
                  <span className={styles.badges}>
                    <span className={styles.category}>{product.category}</span>
                    {productSoldOut(product) && (
                      <span className={styles.badge}>Esgotado</span>
                    )}
                    {discount > 0 && (
                      <span className={styles.badge}>−{discount}%</span>
                    )}
                  </span>
                  <span className={styles.price}>
                    {formatPrice(product.priceCents)}
                  </span>
                </span>
                <span className={styles.name}>{product.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
