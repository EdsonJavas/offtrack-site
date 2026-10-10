import { brand } from "@/data/brand";
import { Reveal } from "@/components/ui/Reveal";
import { Star } from "@/components/ui/Star";
import styles from "./Contact.module.css";

export function Contact() {
  const whatsappUrl = brand.whatsapp
    ? `${brand.whatsapp.url}?text=${encodeURIComponent(brand.whatsappMessage)}`
    : undefined;

  return (
    <section id="contato" className={styles.section}>
      <div className={`container ${styles.inner}`}>
        <Reveal>
          <p className="eyebrow">Contato</p>
          <h2 className={styles.title}>
            Fala com <span>a gente.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.1} className={styles.actions}>
          <a
            href={brand.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.primary}
          >
            <Star size={12} />
            Direct no Instagram
          </a>

          {whatsappUrl && (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={styles.secondary}>
              WhatsApp
            </a>
          )}

          <p className={styles.handle}>{brand.instagram.handle}</p>
        </Reveal>
      </div>
    </section>
  );
}
