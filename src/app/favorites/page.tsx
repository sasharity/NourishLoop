
"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import RecipeCard from "@/components/RecipeCard";
import { useFavorites } from "@/components/FavoritesProvider";
import { recipes } from "@/data/recipes";

export default function FavoritesPage() {
  const { favorites } = useFavorites();

  const savedRecipes = recipes.filter((recipe) =>
    favorites.includes(recipe.id)
  );

  return (
    <>
      <Navbar />

      <main className="page-container">
        <section className="library-heading">
          <span className="eyebrow">YOUR PERSONAL COLLECTION</span>
          <h1>My Favorites</h1>
          <p>Your saved recipes, all in one place.</p>
        </section>

        <section className="library-results">
          <div className="section-heading">
            <h2>
              {savedRecipes.length}{" "}
              {savedRecipes.length === 1 ? "saved recipe" : "saved recipes"}
            </h2>

            <Link href="/recipes" className="text-link">
              Explore recipes →
            </Link>
          </div>

          {savedRecipes.length === 0 ? (
            <div className="state-card">
              <div className="empty-favorite-icon">♡</div>
              <h3>No saved recipes yet</h3>
              <p>
                Browse the recipe library and tap the heart icon to save
                your favourites.
              </p>
              <Link href="/recipes" className="primary-button">
                Explore recipes
              </Link>
            </div>
          ) : (
            <div className="recipe-grid">
              {savedRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
