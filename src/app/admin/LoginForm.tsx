"use client";

import { useActionState } from "react";
import { brand } from "@/data/brand";
import { loginAction, type ActionState } from "./actions";
import styles from "./admin.module.css";

export function LoginForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    loginAction,
    {},
  );

  return (
    <form action={action} className={styles.login}>
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
        />
      </label>
      {state.error && <p className={styles.error}>{state.error}</p>}
      <button type="submit" className={styles.primary} disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
