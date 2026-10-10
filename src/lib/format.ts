/** Dinheiro em centavos inteiros: nada de float em preço. */
export function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** "89,90" | "89.9" | "R$ 1.299,00" → centavos. */
export function parsePrice(input: string): number {
  const clean = input.replace(/[^\d,.-]/g, "");
  const normalized = clean.includes(",")
    ? clean.replace(/\./g, "").replace(",", ".")
    : clean;
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? Math.round(value * 100) : 0;
}

/** Parte da entrada (80%) arredondada para cima; o saldo é o resto exato. */
export function splitDeposit(
  cents: number,
  ratio = 0.8,
): { deposit: number; balance: number } {
  const deposit = Math.ceil(cents * ratio);
  return { deposit, balance: cents - deposit };
}
