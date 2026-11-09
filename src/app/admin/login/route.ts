import { NextResponse } from "next/server";
import { checkPassword, createSession } from "@/lib/adminAuth";

/**
 * Login por fetch (não por server action): assim a página não é re-renderizada
 * no ato e o LoginForm tem tempo de mostrar a animação de entrada antes de
 * navegar para o painel.
 *
 * Contra força bruta: toda senha errada espera um pouco antes de responder e,
 * depois de algumas erradas seguidas do mesmo endereço, o login trava por um
 * tempo. A contagem vive na memória da instância (melhor esforço em serverless:
 * instâncias diferentes não a compartilham), então não substitui uma senha forte.
 */
const MAX_FAILURES = 5;
const WINDOW_MS = 10 * 60 * 1000;
const FAILURE_DELAY_MS = 800;

const failures = new Map<string, { count: number; first: number }>();

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "desconhecido"
  );
}

function blockedFor(key: string, now: number): number {
  const entry = failures.get(key);
  if (!entry) return 0;
  if (now - entry.first > WINDOW_MS) {
    failures.delete(key);
    return 0;
  }
  return entry.count >= MAX_FAILURES ? entry.first + WINDOW_MS - now : 0;
}

export async function POST(request: Request) {
  const key = clientKey(request);
  const now = Date.now();

  const wait = blockedFor(key, now);
  if (wait > 0) {
    const minutes = Math.ceil(wait / 60000);
    return NextResponse.json(
      {
        error: `Muitas tentativas. Tente de novo em ${minutes} ${minutes === 1 ? "minuto" : "minutos"}.`,
      },
      { status: 429, headers: { "Retry-After": String(Math.ceil(wait / 1000)) } },
    );
  }

  const form = await request.formData().catch(() => null);
  const password = String(form?.get("password") ?? "");

  if (!checkPassword(password)) {
    const entry = failures.get(key);
    failures.set(
      key,
      entry ? { ...entry, count: entry.count + 1 } : { count: 1, first: now },
    );
    await new Promise((resolve) => setTimeout(resolve, FAILURE_DELAY_MS));
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  failures.delete(key);
  await createSession();
  return NextResponse.json({ ok: true });
}
