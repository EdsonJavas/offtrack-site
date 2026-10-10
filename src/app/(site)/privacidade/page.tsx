import { brand } from "@/data/brand";
import { LegalPage } from "@/components/Legal/LegalPage";

export const metadata = { title: "Privacidade" };

/** Texto base (LGPD) para o dono revisar. */
export default function PrivacidadePage() {
  return (
    <LegalPage title="Privacidade" updated="10/10/2026">
      <h2>O que o site guarda no seu aparelho</h2>
      <p>
        O carrinho e os favoritos ficam salvos só no seu navegador
        (armazenamento local), para você continuar de onde parou. Esses dados
        não são enviados para a {brand.name} nem para terceiros e podem ser
        apagados limpando os dados do site no navegador.
      </p>

      <h2>Medição de audiência</h2>
      <p>
        Usamos o Vercel Analytics para contar visitas e páginas vistas. Ele não
        usa cookies e não identifica pessoas. [Se o dono ativar pixel do Meta ou
        Google Analytics, incluir aqui, com aviso de cookies.]
      </p>

      <h2>Pedidos</h2>
      <p>
        O pedido é enviado por você pelo Direct do Instagram
        {brand.whatsapp ? " ou pelo WhatsApp" : ""}. A conversa e os dados que
        você compartilhar ali (nome, endereço de entrega, comprovante de Pix)
        são tratados pela {brand.name}
        apenas para atender o pedido e ficam sujeitos também às políticas da
        Meta.
      </p>

      <h2>Seus direitos</h2>
      <p>
        Você pode pedir acesso, correção ou exclusão dos seus dados pelo{" "}
        {brand.instagram.handle}
        {brand.email ? ` ou por ${brand.email}` : ""}.
      </p>

      <h2>Responsável</h2>
      <p>
        {brand.legal.entity ?? "[Razão social ou nome do responsável]"} ·{" "}
        {brand.legal.document ?? "[CNPJ ou CPF]"} · {brand.city}, {brand.state}.
      </p>
    </LegalPage>
  );
}
