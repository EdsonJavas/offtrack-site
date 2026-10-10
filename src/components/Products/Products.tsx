import { brand } from "@/data/brand";
import { mockProducts, formatPrice, type Product } from "@/data/mock/products";
import { Reveal } from "@/components/ui/Reveal";
import { Star } from "@/components/ui/Star";
import styles from "./Products.module.css";

/**
 * Seleção de peças. Hoje lê `mockProducts` (dados de exemplo).
 * Antes de publicar: trocar pela lista confirmada pelo dono e pelas fotos reais.
 */
export function Products() {
  return (
    <section id="selecao" className={styles.section}>
      <div className="container">
        <Reveal className={styles.head}>
          <div>
            <p className="eyebrow">Seleção</p>
            <h2 className={styles.title}>Peças sob encomenda.</h2>
          </div>
          <p className={styles.note}>
            Camisetas, oversized, polos e bermudas. Você escolhe, a gente confirma com o
            fornecedor e combina tudo pelo Direct.
          </p>
        </Reveal>
      </div>

      <ul className={styles.track}>
        {mockProducts.map((product, i) => (
          <li key={product.id} className={styles.item}>
            <Reveal delay={0.05 * (i % 3)}>
              <ProductCard product={product} index={i} />
            </Reveal>
          </li>
        ))}
      </ul>

      <div className={`container ${styles.footer}`}>
        <a
          href={brand.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.cta}
        >
          Encomendar pelo Direct
          <Star size={12} />
        </a>
      </div>
    </section>
  );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <article className={styles.card}>
      {/* Placeholder visual até as fotos reais das peças chegarem. */}
      <div className={styles.art} aria-hidden="true">
        <span className={styles.artLetter}>{product.category.charAt(0)}</span>
        <Star size={18} className={styles.artStar} />
        <span className={styles.artIndex}>{String(index + 1).padStart(2, "0")}</span>
      </div>

      <div className={styles.meta}>
        <div>
          <p className={styles.category}>{product.category}</p>
          <h3 className={styles.name}>{product.name}</h3>
        </div>
        <p className={styles.price}>{formatPrice(product.price)}</p>
      </div>

      <dl className={styles.specs}>
        <div>
          <dt>Cores</dt>
          <dd>{product.colors.join(" · ")}</dd>
        </div>
        <div>
          <dt>Tamanhos</dt>
          <dd>{product.sizes.join(" ")}</dd>
        </div>
      </dl>
    </article>
  );
}
