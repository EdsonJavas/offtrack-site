"use client";

import { useEffect, useState } from "react";
import { brand } from "@/data/brand";
import type { SendResult } from "@/lib/order";
import styles from "./OrderMessage.module.css";

interface OrderMessageProps {
  message: string;
  result: SendResult | null;
}

/**
 * Plano B visível depois de "Chamar no Direct": a mensagem inteira num campo
 * selecionável com botão de copiar, e o passo a passo para quem abriu o Direct vazio.
 */
export function OrderMessage({ message, result }: OrderMessageProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  if (!result || result === "whatsapp") return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      // O campo abaixo fica selecionável para copiar na mão.
    }
  };

  return (
    <div className={styles.box} role="status">
      <p className={styles.title}>
        {result === "copied"
          ? "Pedido copiado."
          : "Não deu para copiar sozinho."}
      </p>
      <ol className={styles.steps}>
        <li>Abrimos o Direct da {brand.name} em outra aba.</li>
        <li>
          {result === "copied"
            ? "Cole a mensagem lá (segure e Colar, ou Ctrl+V)."
            : "Copie a mensagem abaixo e cole lá."}
        </li>
        <li>Envie. A gente responde com disponibilidade e prazo.</li>
      </ol>
      <textarea
        className={styles.text}
        readOnly
        value={message}
        rows={5}
        onFocus={(e) => e.currentTarget.select()}
      />
      <div className={styles.actions}>
        <button type="button" className={styles.copy} onClick={copy}>
          {copied ? "Copiado ✓" : "Copiar mensagem"}
        </button>
        <a
          href={brand.instagram.direct}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          Abrir o Direct de novo
        </a>
      </div>
    </div>
  );
}
