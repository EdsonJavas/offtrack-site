"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { whatsappUrl, type StoreSettings } from "@/data/types";

/** Dados da loja prontos para a interface (o dono preenche em /admin/loja). */
export interface StoreInfo {
  /** Quando existe, os pedidos vão para o WhatsApp com o texto pronto. */
  whatsapp?: { number: string; url: string };
  email?: string;
  legal: { entity?: string; document?: string; address?: string };
}

const StoreContext = createContext<StoreInfo>({ legal: {} });

export function toStoreInfo(settings: StoreSettings): StoreInfo {
  const digits = settings.whatsapp?.replace(/\D/g, "") ?? "";
  return {
    whatsapp: digits ? { number: digits, url: whatsappUrl(digits) } : undefined,
    email: settings.email || undefined,
    legal: {
      entity: settings.legalEntity || undefined,
      document: settings.legalDocument || undefined,
      address: settings.legalAddress || undefined,
    },
  };
}

export function StoreProvider({
  settings,
  children,
}: {
  settings: StoreSettings;
  children: ReactNode;
}) {
  const value = useMemo(() => toStoreInfo(settings), [settings]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreInfo {
  return useContext(StoreContext);
}
