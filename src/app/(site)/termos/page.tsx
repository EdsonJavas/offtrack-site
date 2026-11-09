import { brand } from "@/data/brand";
import { getStore } from "@/lib/catalog";
import { LegalPage } from "@/components/Legal/LegalPage";

export const metadata = { title: "Termos e trocas" };

/**
 * Texto base (CDC, Lei 8.078/90 art. 49, e Decreto 7.962/2013). As regras que
 * só o dono pode decidir (envio para fora, frete de devolução, cancelamento,
 * troca por tamanho/cor) vêm do painel (/admin/loja). Enquanto ele não as
 * escreve, o texto remete ao atendimento em vez de inventar uma regra.
 */
export default async function TermosPage() {
  const store = await getStore();
  const contact = [
    store.email,
    store.whatsapp ? "WhatsApp" : null,
    brand.instagram.handle,
  ]
    .filter(Boolean)
    .join(", ");
  const seller = [
    store.legalEntity,
    store.legalDocument,
    store.legalAddress ?? `${brand.city}, ${brand.state}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <LegalPage title="Termos e trocas" updated="09/11/2026">
      <h2>Como a compra funciona</h2>
      <p>
        A {brand.name} vende peças sob encomenda. O pedido começa pelo Direct do
        Instagram
        {store.whatsapp ? " ou pelo WhatsApp" : ""}: você escolhe a peça, a cor
        e o tamanho, e a loja confirma modelo, disponibilidade, valor e prazo
        com o fornecedor antes de qualquer pagamento. Os valores exibidos no
        site são referência e podem ser ajustados nessa confirmação.
      </p>

      <h2>Pagamento</h2>
      <p>
        Após a confirmação, o cliente paga 80% do valor via Pix como entrada. Os
        20% restantes são pagos quando a peça chega, antes da entrega. Nenhum
        pagamento é feito pelo site.
      </p>

      <h2>Prazo e entrega</h2>
      <p>
        O prazo depende do fornecedor e do transporte e é informado antes da
        confirmação do pedido. As entregas são feitas em {brand.city},{" "}
        {brand.state}, inclusive em mãos, em local e horário combinados.{" "}
        {store.shippingPolicy ??
          "Envio para outras cidades: consulte no atendimento antes de confirmar o pedido."}
      </p>

      <h2>Arrependimento (7 dias)</h2>
      <p>
        Nas compras feitas fora da loja física, o cliente pode desistir em até 7
        dias corridos a partir do recebimento da peça, sem precisar justificar
        (art. 49 do Código de Defesa do Consumidor). Nesse caso, os valores
        pagos são devolvidos integralmente, pelo mesmo meio.{" "}
        {store.returnShippingPolicy ?? ""}
      </p>

      <h2>Cancelamento antes da entrega</h2>
      <p>
        {store.cancellationPolicy ??
          "As condições de cancelamento depois do pedido ao fornecedor são informadas no atendimento, antes do pagamento da entrada."}
      </p>

      <h2>Troca e defeito</h2>
      <p>
        Peça com defeito de fabricação pode ser trocada ou ter o valor devolvido
        em até 30 dias após a entrega.{" "}
        {store.exchangePolicy ??
          "Troca por tamanho ou cor: combine no atendimento, antes de confirmar o pedido."}
      </p>

      <h2>Identificação do vendedor</h2>
      <p>
        {seller} · Atendimento: {contact}.
      </p>
    </LegalPage>
  );
}
