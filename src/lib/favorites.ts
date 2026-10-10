/**
 * Peças favoritas, salvas no navegador. Store simples para usar com
 * useSyncExternalStore (no servidor, nada é favorito).
 */
const STORAGE_KEY = "offtrack-favorites";
const listeners = new Set<() => void>();
let cache: Set<string> | null = null;
let version = 0;

function load(): Set<string> {
  if (cache) return cache;
  try {
    cache = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"));
  } catch {
    cache = new Set();
  }
  return cache;
}

function persist(next: Set<string>) {
  cache = next;
  version++;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  } catch {
    // Storage indisponível: fica só em memória.
  }
  listeners.forEach((l) => l());
}

// Outra aba mudou os favoritos: recarrega e avisa.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY) return;
    cache = null;
    version++;
    listeners.forEach((l) => l());
  });
}

export const favoritesStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  /** Muda a cada alteração: serve de snapshot para quem lista favoritos. */
  version() {
    return version;
  },
  has(id: string) {
    return load().has(id);
  },
  toggle(id: string) {
    const next = new Set(load());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    persist(next);
  },
};
