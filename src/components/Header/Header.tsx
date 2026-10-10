"use client";

import { useEffect, useState } from "react";
import { brand } from "@/data/brand";
import { useCart } from "@/components/Cart/CartProvider";
import { Star } from "@/components/ui/Star";
import styles from "./Header.module.css";

/** Na ordem em que as seções aparecem na página. */
const links = [
  { href: "#selecao", label: "Seleção" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#marca", label: "Marca" },
  { href: "#faq", label: "Dúvidas" },
  { href: "#contato", label: "Contato" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const cart = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <a href="#top" className={styles.monogram} aria-label={`${brand.name}, voltar ao topo`}>
        {brand.monogram}
      </a>

      <nav className={styles.nav} aria-label="Seções">
        {links.map((link) => (
          <a key={link.href} href={link.href} className={styles.link}>
            {link.label}
          </a>
        ))}
      </nav>

      <div className={styles.right}>
        <a
          href={brand.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.instagram}
        >
          <Star size={10} />
          <span>{brand.instagram.handle}</span>
        </a>

        <button
          type="button"
          className={`${styles.cart} ${cart.count > 0 ? styles.cartFull : ""}`}
          onClick={cart.open}
          aria-label={`Abrir carrinho, ${cart.count} ${cart.count === 1 ? "peça" : "peças"}`}
        >
          <span className={styles.cartLabel}>Carrinho</span>
          <span className={styles.cartCount}>{String(cart.count).padStart(2, "0")}</span>
        </button>
      </div>
    </header>
  );
}
