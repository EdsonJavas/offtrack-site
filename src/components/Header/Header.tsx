"use client";

import { useEffect, useState } from "react";
import { brand } from "@/data/brand";
import { Star } from "@/components/ui/Star";
import styles from "./Header.module.css";

const links = [
  { href: "#marca", label: "Marca" },
  { href: "#selecao", label: "Seleção" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#contato", label: "Contato" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);

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

      <a
        href={brand.instagram.url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.instagram}
      >
        <Star size={10} />
        <span>{brand.instagram.handle}</span>
      </a>
    </header>
  );
}
