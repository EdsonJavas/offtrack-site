"use client";

import { useSyncExternalStore } from "react";
import { favoritesStore } from "@/lib/favorites";

export function useFavorite(id: string): [boolean, () => void] {
  const isFavorite = useSyncExternalStore(
    favoritesStore.subscribe,
    () => favoritesStore.has(id),
    () => false,
  );
  return [isFavorite, () => favoritesStore.toggle(id)];
}
