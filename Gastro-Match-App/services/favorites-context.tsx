import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Recipe, recipeService } from './api';
import { useAuth } from './auth-context';

type FavoriteEntry = { id: number; recipe: Recipe };
type FavoritesContextValue = {
  favorites: FavoriteEntry[];
  loading: boolean;
  isFavorite: (recipeId: number) => boolean;
  refreshFavorites: () => Promise<void>;
  toggleFavorite: (recipe: Recipe) => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const favoritesRef = useRef<FavoriteEntry[]>([]);
  const pendingToggles = useRef(new Map<number, object>());
  const requestVersion = useRef(0);
  const mutationVersion = useRef(0);
  const currentUserId = useRef<number | null>(user?.id ?? null);

  const commitFavorites = useCallback((next: FavoriteEntry[]) => {
    favoritesRef.current = next;
    setFavorites(next);
  }, []);

  const refreshFavorites = useCallback(async () => {
    const userId = user?.id;
    if (!userId) {
      commitFavorites([]);
      setLoading(false);
      return;
    }

    const thisRequest = ++requestVersion.current;
    const thisMutationVersion = mutationVersion.current;
    setLoading(true);
    try {
      const saved = await recipeService.favorites();
      if (
        thisRequest !== requestVersion.current ||
        thisMutationVersion !== mutationVersion.current ||
        currentUserId.current !== userId ||
        pendingToggles.current.size > 0
      ) return;

      const unique = new Map<number, FavoriteEntry>();
      saved.forEach(entry => unique.set(entry.recipe.id, entry));
      commitFavorites([...unique.values()]);
    } finally {
      if (thisRequest === requestVersion.current) setLoading(false);
    }
  }, [commitFavorites, user?.id]);

  useEffect(() => {
    currentUserId.current = user?.id ?? null;
    requestVersion.current += 1;
    mutationVersion.current += 1;
    pendingToggles.current.clear();
    commitFavorites([]);
    if (user) refreshFavorites().catch(() => setLoading(false));
    else setLoading(false);
  }, [commitFavorites, refreshFavorites, user?.id]);

  const toggleFavorite = useCallback(async (recipe: Recipe) => {
    const userId = user?.id;
    if (!userId) throw new Error('Entre na sua conta para salvar favoritos.');
    if (pendingToggles.current.has(recipe.id)) return;

    const operation = {};
    pendingToggles.current.set(recipe.id, operation);
    const previous = favoritesRef.current;
    const wasFavorite = previous.some(entry => entry.recipe.id === recipe.id);
    const shouldFavorite = !wasFavorite;
    const updateFavorite = (entries: FavoriteEntry[], enabled: boolean) => {
      const withoutRecipe = entries.filter(entry => entry.recipe.id !== recipe.id);
      return enabled ? [...withoutRecipe, { id: -recipe.id, recipe }] : withoutRecipe;
    };

    mutationVersion.current += 1;
    commitFavorites(updateFavorite(previous, shouldFavorite));
    try {
      const result = await recipeService.toggleFavorite(recipe.id);
      if (currentUserId.current === userId && pendingToggles.current.get(recipe.id) === operation) {
        commitFavorites(updateFavorite(favoritesRef.current, result.favorite));
      }
    } catch (error) {
      if (currentUserId.current === userId && pendingToggles.current.get(recipe.id) === operation) {
        pendingToggles.current.delete(recipe.id);
        mutationVersion.current += 1;
        try {
          await refreshFavorites();
        } catch {
          commitFavorites(updateFavorite(favoritesRef.current, wasFavorite));
        }
      }
      throw error;
    } finally {
      if (pendingToggles.current.get(recipe.id) === operation) {
        pendingToggles.current.delete(recipe.id);
        mutationVersion.current += 1;
      }
    }
  }, [commitFavorites, refreshFavorites, user?.id]);

  const isFavorite = useCallback((recipeId: number) => favorites.some(entry => entry.recipe.id === recipeId), [favorites]);

  return <FavoritesContext.Provider value={{ favorites, loading, isFavorite, refreshFavorites, toggleFavorite }}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const value = useContext(FavoritesContext);
  if (!value) throw new Error('useFavorites precisa estar dentro de FavoritesProvider.');
  return value;
}
