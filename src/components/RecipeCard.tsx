
import Link from "next/link";
import type { Recipe } from "@/data/recipes";

type RecipeCardProps = {
  recipe: Recipe;
};

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <article className="recipe-card">
      <Link href={`/recipes/${recipe.id}`} className="recipe-image-link">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="recipe-image"
        />
        <span className="image-category">{recipe.category}</span>
      </Link>

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
