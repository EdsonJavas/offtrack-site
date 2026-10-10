"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { brand } from "@/data/brand";
import { useCart } from "@/components/Cart/CartProvider";
import { useModal } from "@/hooks/useModal";
import { Star } from "@/components/ui/Star";
import { LogoStar } from "@/components/ui/LogoStar";
import styles from "./Header.module.css";

/** Na ordem em que as seções aparecem na página. */
const links = [
  { href: "/#selecao", label: "Seleção" },
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/#marca", label: "Marca" },
  { href: "/#faq", label: "Dúvidas" },
  { href: "/#contato", label: "Contato" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const cart = useCart();

  useEffect(() => {
    const onScroll = () =>
      setScrolled(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useModal(menuOpen, menuRef, closeMenu);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <Link
        href="/#top"
        className={styles.monogram}
        aria-label={`${brand.name}, voltar ao topo`}
      >
        {brand.monogram}
        <LogoStar className={styles.monogramStar} />
      </Link>

      <nav className={styles.nav} aria-label="Seções">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={styles.link}>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className={styles.right}>
        <a
          href={brand.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.instagram}
        >
          <Star size={12} />
          <span>{brand.instagram.handle}</span>
        </a>

        <button
          type="button"
          className={`${styles.cart} ${cart.count > 0 ? styles.cartFull : ""}`}
          onClick={cart.open}
          aria-label={`Abrir carrinho, ${cart.count} ${cart.count === 1 ? "peça" : "peças"}`}
        >
          <span className={styles.cartLabel}>Carrinho</span>
          <span className={styles.cartCount}>
            {String(cart.count).padStart(2, "0")}
          </span>
        </button>

        <button
          type="button"
          className={styles.burger}
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
        </button>
      </div>

      {/* Menu do celular: tela cheia, links grandes. Vai por portal para o body:
          dentro do header ele herdaria o mix-blend-mode e o hero vazaria por cima. */}
      {menuOpen &&
        createPortal(
          <div
            ref={menuRef}
            className={styles.menu}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            tabIndex={-1}
          >
            <button
              type="button"
              className={styles.menuClose}
              onClick={closeMenu}
              aria-label="Fechar menu"
            >
              <span />
              <span />
            </button>
            <nav className={styles.menuNav} aria-label="Seções">
              {links.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={styles.menuLink}
                  onClick={closeMenu}
                >
                  <span className={styles.menuIndex}>0{i + 1}</span>
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className={styles.menuFoot}>
              <a
                href={brand.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Star size={10} /> {brand.instagram.handle}
              </a>
              <p>
                {brand.city}, {brand.state} · {brand.slogan}
              </p>
            </div>
          </div>,
          document.body,
        )}
    </header>
  );
}
