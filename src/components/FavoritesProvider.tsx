"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";

type FavoritesContextType = {
  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

const STORAGE_KEY = "nourish-loop-favorites";

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function loadForUser(uid: string | null) {
      setUserId(uid);

      if (!uid) {
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          setFavorites(saved ? JSON.parse(saved) : []);
        } catch {
          setFavorites([]);
        }
        return;
      }

      const { data, error } = await supabase
        .from("favorites")
        .select("recipe_id");

      if (error) {
        console.error("Could not load favorites:", error.message);
        setFavorites([]);
        return;
      }

      setFavorites((data ?? []).map((row) => String(row.recipe_id)));
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      loadForUser(user?.id ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadForUser(session?.user?.id ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function toggleFavorite(id: string) {
    const currentlyFavorite = favorites.includes(id);
    const nextFavorites = currentlyFavorite
      ? favorites.filter((item) => item !== id)
      : [...favorites, id];

    setFavorites(nextFavorites);

    if (!userId) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextFavorites));
      } catch {
        console.error("Could not save favorites.");
      }
      return;
    }

    const supabase = createClient();

    if (currentlyFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("recipe_id", id);

      if (error) {
        console.error("Could not remove favorite:", error.message);
        setFavorites(favorites);
      }
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: userId, recipe_id: id });

      if (error) {
        console.error("Could not save favorite:", error.message);
        setFavorites(favorites);
      }
    }
  }

  function isFavorite(id: string) {
    return favorites.includes(id);
  }

  return (
    <FavoritesContext.Provider
      value={{ favorites, isFavorite, toggleFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites must be used inside FavoritesProvider");
  }

  return context;
}
