"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { brand } from "@/data/brand";
import { LogoStar } from "@/components/ui/LogoStar";
import styles from "./admin.module.css";

const WELCOME_MS = 1150;

type Status = "idle" | "checking" | "welcome";

/**
 * Entrada do painel. Senha certa: o formulário recua, o carimbo OT. bate na
 * tela com a estrela, uma fita corre e só então o painel abre.
 * O login vai por fetch (rota /admin/login) para a página não re-renderizar
 * antes da animação.
 */
export function LoginForm() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const welcome = status === "welcome";

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("checking");
    setError(null);
    try {
      const res = await fetch("/admin/login", {
        method: "POST",
        body: new FormData(e.currentTarget),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Não deu para entrar. Tente de novo.");
        setStatus("idle");
        return;
      }
      setStatus("welcome");
      window.setTimeout(() => {
        router.replace("/admin");
        router.refresh();
      }, WELCOME_MS);
    } catch {
      setError("Sem conexão. Tente de novo.");
      setStatus("idle");
    }
  };

  return (
    <div className={`${styles.loginWrap} ${welcome ? styles.loginWelcome : ""}`}>
      <form onSubmit={submit} className={styles.login} aria-hidden={welcome}>
        <p className={styles.eyebrow}>{brand.name} · Painel</p>
        <h1 className={styles.title}>Entrar</h1>
        <label className={styles.field}>
          <span>Senha</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            autoFocus
            disabled={status !== "idle"}
          />
        </label>
        {error && <p className={styles.error}>{error}</p>}
        <button
          type="submit"
          className={styles.primary}
          disabled={status !== "idle"}
        >
          {status === "checking" ? "Conferindo…" : "Entrar"}
        </button>
      </form>

      {welcome && (
        <div className={styles.welcome} role="status" aria-live="polite">
          <span className={styles.welcomeStamp} aria-hidden="true">
            OT.
            <LogoStar className={styles.welcomeStar} />
          </span>
          <p className={styles.welcomeText}>Bem-vindo de volta.</p>
          <span className={styles.welcomeTape} aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
