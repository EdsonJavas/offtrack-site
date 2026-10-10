"use client";

import { useEffect, useRef, type RefObject } from "react";
import { modalStack } from "@/lib/modalStack";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Comportamento completo de modal: trava o fundo (inert + scroll), prende o foco
 * dentro do contêiner, fecha com Esc (só o modal do topo) e devolve o foco ao
 * elemento que abriu.
 */
export function useModal(
  open: boolean,
  container: RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  const token = useRef(Symbol("modal"));

  useEffect(() => {
    if (!open) return;
    const el = container.current;
    const opener = document.activeElement as HTMLElement | null;
    const id = token.current;
    modalStack.push(id);

    const focusables = () =>
      Array.from(el?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    (focusables()[0] ?? el)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (!modalStack.isTop(id)) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !el) return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      modalStack.pop(id);
      opener?.focus?.();
    };
  }, [open, container, onClose]);
}
