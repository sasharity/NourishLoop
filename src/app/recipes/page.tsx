
"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import RecipeCard from "@/components/RecipeCard";
import { recipes } from "@/data/recipes";

const categories = ["All", "Breakfast", "Lunch", "Dinner", "Snacks"];

export default function RecipesPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";

  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState("");
  const [loadError, setLoadError] = useState(false);

  
const filteredRecipes = useMemo(() => {
  return recipes.filter((recipe) => {
    const matchesCategory =
      category === "All" || recipe.category === category;

    const matchesSearch = recipe.title
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    return matchesCategory && matchesSearch;
  });
}, [category, search]);


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

          {loadError ? (
            <div className="state-card">
              <h3>Unable to load recipes</h3>
              <p>Please try again.</p>
              <button
                className="primary-button"
                onClick={() => setLoadError(false)}
              >
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
