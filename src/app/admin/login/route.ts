import { NextResponse } from "next/server";
import { checkPassword, createSession } from "@/lib/adminAuth";

/**
 * Login por fetch (não por server action): assim a página não é re-renderizada
 * no ato e o LoginForm tem tempo de mostrar a animação de entrada antes de
 * navegar para o painel.
 */
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const password = String(form?.get("password") ?? "");
  if (!checkPassword(password)) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }
  await createSession();
  return NextResponse.json({ ok: true });
}
