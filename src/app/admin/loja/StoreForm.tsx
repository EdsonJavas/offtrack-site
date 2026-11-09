"use client";

import { useActionState } from "react";
import { brand } from "@/data/brand";
import type { StoreSettings } from "@/data/types";
import { saveStoreAction, type ActionState } from "../actions";
import { Star } from "@/components/ui/Star";
import admin from "../admin.module.css";
import styles from "../ProductForm.module.css";

interface StoreFormProps {
  store: StoreSettings;
  readOnly: boolean;
}

/**
 * Formulário dos dados da loja, no mesmo desenho da ficha da peça (estações).
 * Tudo opcional: o que ficar vazio não aparece no site; o que for preenchido
 * entra no rodapé, nos Termos, na Privacidade e no botão de pedido.
 */
export function StoreForm({ store, readOnly }: StoreFormProps) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    saveStoreAction,
    {},
  );

  return (
    <form action={action} className={styles.form}>
      {readOnly && (
        <p className={admin.notice}>
          <strong>Modo leitura.</strong> Edite estes dados no painel do site
          publicado.
        </p>
      )}

      <p className={styles.lead}>
        Nada aqui é obrigatório para o site funcionar, mas identificação e
        contato são exigidos para vender pela internet (Decreto 7.962/2013).
        O que ficar vazio simplesmente não aparece.
      </p>

      <fieldset className={styles.station} disabled={readOnly}>
        <header className={styles.stationHead}>
          <span className={styles.stationNumber}>01</span>
          <h2 className={styles.stationTitle}>Contato</h2>
          <p className={styles.stationHelp}>
            Com WhatsApp preenchido, o botão de pedido passa a abrir o WhatsApp
            com a mensagem pronta, em vez do Direct (que não aceita texto).
          </p>
        </header>
        <div className={styles.row2}>
          <label className={styles.group}>
            <span className={styles.label}>WhatsApp</span>
            <input
              name="whatsapp"
              inputMode="numeric"
              defaultValue={store.whatsapp ?? ""}
              placeholder="5514999990000"
              className={styles.input}
              autoComplete="off"
            />
            <span className={styles.helpSmall}>
              Só dígitos: 55 + DDD + número.
            </span>
          </label>
          <label className={styles.group}>
            <span className={styles.label}>E-mail de atendimento</span>
            <input
              name="email"
              type="email"
              defaultValue={store.email ?? ""}
              placeholder="contato@offtrack.com.br"
              className={styles.input}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className={styles.station} disabled={readOnly}>
        <header className={styles.stationHead}>
          <span className={styles.stationNumber}>02</span>
          <h2 className={styles.stationTitle}>Identificação</h2>
          <p className={styles.stationHelp}>
            Aparece no rodapé, nos Termos e na Privacidade.
          </p>
        </header>
        <div className={styles.row3}>
          <label className={styles.group}>
            <span className={styles.label}>Razão social ou responsável</span>
            <input
              name="legalEntity"
              defaultValue={store.legalEntity ?? ""}
              placeholder={`${brand.name} Streetwear LTDA`}
              className={styles.input}
            />
          </label>
          <label className={styles.group}>
            <span className={styles.label}>CNPJ ou CPF</span>
            <input
              name="legalDocument"
              defaultValue={store.legalDocument ?? ""}
              placeholder="00.000.000/0001-00"
              className={styles.input}
            />
          </label>
          <label className={styles.group}>
            <span className={styles.label}>Endereço</span>
            <input
              name="legalAddress"
              defaultValue={store.legalAddress ?? ""}
              placeholder={`Rua, número, bairro, ${brand.city}, ${brand.state}`}
              className={styles.input}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className={styles.station} disabled={readOnly}>
        <header className={styles.stationHead}>
          <span className={styles.stationNumber}>03</span>
          <h2 className={styles.stationTitle}>Políticas</h2>
          <p className={styles.stationHelp}>
            Cada texto entra na seção correspondente de “Termos e trocas”, com
            as suas palavras. Enquanto vazio, o site remete ao atendimento.
          </p>
        </header>

        <label className={styles.group}>
          <span className={styles.label}>Envio para outras cidades</span>
          <textarea
            name="shippingPolicy"
            rows={2}
            defaultValue={store.shippingPolicy ?? ""}
            placeholder="Ex.: Enviamos para todo o Brasil pelos Correios; o frete é calculado e informado no atendimento antes da confirmação."
            className={styles.input}
          />
        </label>

        <label className={styles.group}>
          <span className={styles.label}>
            Frete da devolução (arrependimento em 7 dias)
          </span>
          <textarea
            name="returnShippingPolicy"
            rows={2}
            defaultValue={store.returnShippingPolicy ?? ""}
            placeholder="Ex.: O frete da devolução é por conta da loja."
            className={styles.input}
          />
        </label>

        <label className={styles.group}>
          <span className={styles.label}>Cancelamento antes da entrega</span>
          <textarea
            name="cancellationPolicy"
            rows={3}
            defaultValue={store.cancellationPolicy ?? ""}
            placeholder="Ex.: Se o cliente cancelar depois do pedido ao fornecedor, a entrada é devolvida em até 7 dias, descontado o frete já pago. Se o fornecedor atrasar ou não entregar, a entrada é devolvida integralmente em até 5 dias úteis."
            className={styles.input}
          />
        </label>

        <label className={styles.group}>
          <span className={styles.label}>Troca por tamanho ou cor</span>
          <textarea
            name="exchangePolicy"
            rows={2}
            defaultValue={store.exchangePolicy ?? ""}
            placeholder="Ex.: Troca por tamanho ou cor em até 7 dias, peça sem uso e com etiqueta; o frete da troca é por conta do cliente."
            className={styles.input}
          />
        </label>
      </fieldset>

      <div className={styles.bar}>
        {state.error ? (
          <p className={styles.barError}>{state.error}</p>
        ) : state.ok ? (
          <p className={styles.barInfo}>Dados salvos. O site já está atualizado.</p>
        ) : (
          <p className={styles.barInfo}>Contato · identificação · políticas</p>
        )}
        <div className={styles.barActions}>
          <button
            type="submit"
            className={styles.save}
            disabled={pending || readOnly}
          >
            {pending ? "Salvando…" : "Salvar dados da loja"}
            <Star size={10} />
          </button>
        </div>
      </div>
    </form>
  );
}
