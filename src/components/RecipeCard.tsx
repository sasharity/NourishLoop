"use client";
import Link from "next/link";
import type { Recipe } from "@/data/recipes";
import { useFavorites } from "@/components/FavoritesProvider";


type RecipeCardProps = {
  recipe: Recipe;
};

export default function RecipeCard({ recipe }: RecipeCardProps) {
   const { isFavorite, toggleFavorite } = useFavorites();
   const saved = isFavorite(recipe.id);

    return (
    <article className="recipe-card">
        <div className="recipe-image-link">
            <Link href={`/recipes/${recipe.id}`} >
                <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="recipe-image"
                />
            </Link>

       <span className="image-category">{recipe.category}</span>

        <button
          type="button"
          className={`favorite-button ${saved ? "saved" : ""}`}
          onClick={() => toggleFavorite(recipe.id)}
          aria-label={saved ? "Remove from favourites" : "Save to favourites"}
          aria-pressed={saved}
        >
          {saved ? "♥" : "♡"}
        </button>
        </div>
        
      <div className="recipe-card-content">
        <div className="recipe-card-meta">
        <span>
          ◷ {(Number(recipe.prepTime) || 0) + (Number(recipe.cookTime) || 0)} min
       </span>
          <span>★ {recipe.rating}</span>
        </div>

        <Link href={`/recipes/${recipe.id}`} className="recipe-title-link">
          <h3>{recipe.title}</h3>
        </Link>

        <p>{recipe.description}</p>

        <div className="recipe-card-footer">
          <span className="healthy-label">● Healthy choice</span>
          <Link href={`/recipes/${recipe.id}`} className="small-button">
            View recipe
          </Link>
        </div>
      </div>
    </article>
  );
}
