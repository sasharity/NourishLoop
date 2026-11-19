
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import RecipeCard from "@/components/RecipeCard";
import { supabase } from "@/lib/supabase";
import type { Recipe } from "@/data/recipes";

const categories = ["All", "Breakfast", "Lunch", "Dinner", "Snacks"];

export default function RecipesPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";

  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Get recipes and their ingredients and instructions from Supabase
  const loadRecipes = useCallback(async () => {
    setLoading(true);
    setLoadError(false);

    const { data, error } = await supabase
      .from("recipes")
      .select(`
        *,
        ingredients(name, quantity),
        instructions(step_number, instruction)
      `)
      .order("title");

    if (error) {
      console.error("Error loading recipes:", error.message);
      setLoadError(true);
      setLoading(false);
      return;
    }

    const formattedRecipes = (data ?? []).map((recipe) => ({
      ...recipe,
      ingredients: recipe.ingredients ?? [],
      instructions: (recipe.instructions ?? [])
        .sort(
          (a: { step_number: number }, b: { step_number: number }) =>
            a.step_number - b.step_number
        )
        .map(
          (step: { step_number: number; instruction: string }) =>
            step.instruction
        ),
    })) as Recipe[];

    setRecipes(formattedRecipes);
    setLoading(false);
  }, []);

  // Load recipes when the page opens
  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  // Search and filter recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesCategory =
        category === "All" || recipe.category === category;

      const searchText =
        `${recipe.title} ${recipe.description} ${recipe.category} ${recipe.ingredients
          .map((ingredient) => ingredient.name)
          .join(" ")}`.toLowerCase();

      return matchesCategory && searchText.includes(search.toLowerCase());
    });
  }, [recipes, category, search]);

  return (
    <>
      <Navbar />

      <main className="page-container">
        <section className="library-heading">
          <span className="eyebrow">CURATED KITCHEN</span>
          <h1>Explore Recipes</h1>
          <p>Nutritious, chef-crafted meals designed for daily balance.</p>
        </section>

        <section className="library-controls">
          <input
            type="search"
            placeholder="Search meals or ingredients..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search recipes"
          />

          <div className="filter-row">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={
                  category === item ? "filter-button active" : "filter-button"
                }
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="library-results">
          <div className="section-heading">
            <h2>
              Showing {filteredRecipes.length}{" "}
              {filteredRecipes.length === 1 ? "recipe" : "recipes"}
            </h2>

            <button
              className="text-link"
              onClick={() => {
                setSearch("");
                setCategory("All");
                setLoadError(false);
              }}
            >
              Reset filters
            </button>
          </div>

          {loading ? (
            <div className="state-card">
              <h3>Loading recipes...</h3>
              <p>Please wait while we retrieve your recipes.</p>
            </div>
          ) : loadError ? (
            <div className="state-card">
              <h3>Unable to load recipes</h3>
              <p>Please check your connection and try again.</p>
              <button className="primary-button" onClick={loadRecipes}>
                Retry
              </button>
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="state-card">
              <h3>No recipes found</h3>
              <p>Try another search or choose a different category.</p>
              <button
                className="primary-button"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
              >
                Show all recipes
              </button>
            </div>
          ) : (
            <div className="recipe-grid">
              {filteredRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
