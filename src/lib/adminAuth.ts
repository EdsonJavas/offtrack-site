import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Login do painel: uma senha (`ADMIN_PASSWORD`) e um cookie assinado com `ADMIN_SECRET`.
 * Sem as duas variáveis, o painel fica desligado.
 */
const COOKIE = "ot_admin";
const TTL_DAYS = 30;

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SECRET);
}

function sign(payload: string): string {
  return createHmac("sha256", process.env.ADMIN_SECRET ?? "")
    .update(payload)
    .digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function checkPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  return expected.length > 0 && safeEqual(password, expected);
}

export async function createSession() {
  const expires = Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000;
  const payload = String(expires);
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    expires: new Date(expires),
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  if (!adminConfigured()) return false;
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return false;
  return safeEqual(sign(payload), signature) && Number(payload) > Date.now();
}
