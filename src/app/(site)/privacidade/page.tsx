import { brand } from "@/data/brand";
import { getStore } from "@/lib/catalog";
import { LegalPage } from "@/components/Legal/LegalPage";

export const metadata = { title: "Privacidade" };

/** Texto base (LGPD). Identificação e contato vêm do painel (/admin/loja). */
export default async function PrivacidadePage() {
  const store = await getStore();
  const responsible = [
    store.legalEntity,
    store.legalDocument,
    `${brand.city}, ${brand.state}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <LegalPage title="Privacidade" updated="09/11/2026">
      <h2>O que o site guarda no seu aparelho</h2>
      <p>
        O carrinho e os favoritos ficam salvos só no seu navegador
        (armazenamento local), para você continuar de onde parou. Esses dados
        não são enviados para a {brand.name} nem para terceiros e podem ser
        apagados limpando os dados do site no navegador.
      </p>

      <h2>Medição de audiência</h2>
      <p>
        Contamos visitas e páginas vistas com o Vercel Analytics, e também
        quantas vezes cada peça foi aberta, favoritada, colocada no carrinho ou
        enviada no pedido. São só contagens por peça: não usam cookies, não
        guardam endereço de IP e não identificam pessoas.
      </p>

      <h2>Pedidos</h2>
      <p>
        O pedido é enviado por você pelo Direct do Instagram
        {store.whatsapp ? " ou pelo WhatsApp" : ""}. A conversa e os dados que
        você compartilhar ali (nome, endereço de entrega, comprovante de Pix)
        são tratados pela {brand.name} apenas para atender o pedido e ficam
        sujeitos também às políticas da Meta.
      </p>

      <h2>Seus direitos</h2>
      <p>
        Você pode pedir acesso, correção ou exclusão dos seus dados pelo{" "}
        {brand.instagram.handle}
        {store.email ? ` ou por ${store.email}` : ""}.
      </p>

      <h2>Responsável</h2>
      <p>{responsible}.</p>
    </LegalPage>
  );
}
