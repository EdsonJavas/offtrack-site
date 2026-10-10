import { brand } from "@/data/brand";
import { LegalPage } from "@/components/Legal/LegalPage";

export const metadata = { title: "Termos e trocas" };

/**
 * Texto base para o dono revisar. Trechos entre [colchetes] precisam da decisão dele.
 * Referências: CDC (Lei 8.078/90, art. 49) e Decreto 7.962/2013 (comércio eletrônico).
 */
export default function TermosPage() {
  return (
    <LegalPage title="Termos e trocas" updated="10/10/2026">
      <h2>Como a compra funciona</h2>
      <p>
        A {brand.name} vende peças sob encomenda. O pedido começa pelo Direct do
        Instagram
        {brand.whatsapp ? " ou pelo WhatsApp" : ""}: você escolhe a peça, a cor
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
        {brand.state}, inclusive em mãos, em local e horário combinados. [Envio
        para outras cidades: a definir pelo dono, com transportadora e custo de
        frete.]
      </p>

      <h2>Arrependimento (7 dias)</h2>
      <p>
        Nas compras feitas fora da loja física, o cliente pode desistir em até 7
        dias corridos a partir do recebimento da peça, sem precisar justificar
        (art. 49 do Código de Defesa do Consumidor). Nesse caso, os valores
        pagos são devolvidos integralmente, pelo mesmo meio. [Definir: quem arca
        com o frete de devolução.]
      </p>

      <h2>Cancelamento antes da entrega</h2>
      <p>
        [A definir pelo dono: se o cliente cancelar depois do pedido ao
        fornecedor, a entrada de 80% é devolvida integralmente, parcialmente ou
        não é devolvida? Em que prazo? Se o fornecedor atrasar ou não entregar,
        a loja devolve a entrada em até X dias.]
      </p>

      <h2>Troca e defeito</h2>
      <p>
        Peça com defeito de fabricação pode ser trocada ou ter o valor devolvido
        em até 30 dias após a entrega. Troca por tamanho ou cor: [a definir pelo
        dono: prazo, condições (peça sem uso, com etiqueta) e quem paga o
        frete].
      </p>

      <h2>Identificação do vendedor</h2>
      <p>
        {brand.legal.entity ?? "[Razão social ou nome do responsável]"} ·{" "}
        {brand.legal.document ?? "[CNPJ ou CPF]"} ·{" "}
        {brand.legal.address ??
          `[Endereço completo], ${brand.city}, ${brand.state}`}{" "}
        · Atendimento: {brand.email ?? "[e-mail de contato]"} e{" "}
        {brand.instagram.handle}.
      </p>
    </LegalPage>
  );
}
