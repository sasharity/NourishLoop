
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

type RecipeDetail = {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  prepTime: number;
  cookTime: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  difficulty: string;
  servings: number;
  ingredients: {
    name: string;
    quantity: string;
  }[];
  instructions: string[];
};

export default function RecipeDetailPage() {
  const params = useParams<{ id: string }>();

  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [servings, setServings] = useState(1);
  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchRecipe() {
      setLoading(true);
      setLoadError("");

      try {
        // Fetch recipe details
        const { data: recipeData, error: recipeError } = await supabase
          .from("recipes")
          .select("*")
          .eq("id", params.id)
          .maybeSingle();

        if (recipeError) throw recipeError;

        if (!recipeData) {
          if (!cancelled) setRecipe(null);
          return;
        }

        // Fetch ingredients and instructions
        const [ingredientsResult, instructionsResult] =
          await Promise.all([
            supabase
              .from("ingredients")
              .select("name, quantity, unit")
              .eq("recipe_id", params.id),

            supabase
              .from("instructions")
              .select("step_number, instruction")
              .eq("recipe_id", params.id)
              .order("step_number", { ascending: true }),
          ]);

        if (ingredientsResult.error) throw ingredientsResult.error;
        if (instructionsResult.error) throw instructionsResult.error;

        const loadedRecipe: RecipeDetail = {
          id: recipeData.id,
          title: recipeData.title,
          category: recipeData.category,
          image: recipeData.image ?? "",
          description: recipeData.description ?? "",
          prepTime: recipeData.prep_time,
          cookTime: recipeData.cook_time,
          calories: recipeData.calories ?? 0,
          protein: recipeData.protein ?? 0,
          carbs: recipeData.carbs ?? 0,
          fat: recipeData.fat ?? 0,
          difficulty: recipeData.difficulty ?? "Easy",
          servings: recipeData.servings ?? 1,

          ingredients: ingredientsResult.data.map((item) => ({
            name: item.name,
            quantity: `${item.quantity} ${item.unit}`.trim(),
          })),

          instructions: instructionsResult.data.map(
            (item) => item.instruction
          ),
        };

        if (!cancelled) {
          setRecipe(loadedRecipe);
          setServings(loadedRecipe.servings);
          setCheckedIngredients([]);
        }
      } catch (error) {
        console.error("Error loading recipe:", error);

        if (!cancelled) {
          setLoadError("Unable to load recipe. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRecipe();

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const [unused] = useState(false);

  if (loading) {
    return (
      <main className="page-container">
        <p>Loading recipe...</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="page-container">
        <h1>{loadError}</h1>
        <Link href="/recipes" className="text-link">
          Return to recipes
        </Link>
      </main>
    );
  }

  if (!recipe) {
    return (
      <main className="page-container">
        <h1>Recipe not found</h1>
        <Link href="/recipes" className="text-link">
          Return to recipes
        </Link>
      </main>
    );
  }

  function toggleIngredient(index: number) {
    setCheckedIngredients((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index]
    );
  }

  return (
    <>
      <Navbar />

      <main className="page-container detail-container">
        <Link href="/recipes" className="back-link">
          ← Back to recipes
        </Link>

        <Link href={`/recipes/${recipe.id}/edit`} className="back-link">
          Edit Recipe
        </Link>

        <div className="detail-layout">
          <div className="detail-main">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="detail-image"
            />

            <div className="detail-title">
              <span className="eyebrow">{recipe.category} · HEALTHY EATING</span>
              <h1>{recipe.title}</h1>
              <p>{recipe.description}</p>
            </div>

            <div className="nutrition-grid">
              <div>
                <strong>{recipe.calories}</strong>
                <small>Calories</small>
              </div>
              <div>
                <strong>{recipe.protein}g</strong>
                <small>Protein</small>
              </div>
              <div>
                <strong>{recipe.carbs}g</strong>
                <small>Carbs</small>
              </div>
              <div>
                <strong>{recipe.fat}g</strong>
                <small>Fat</small>
              </div>
            </div>

            <div className="detail-info-grid">
              <div className="info-card">
                <span>◷</span>
                <div>
                  <strong>{recipe.prepTime + recipe.cookTime} min</strong>
                  <small>Total time</small>
                </div>
              </div>
              <div className="info-card">
                <span>✦</span>
                <div>
                  <strong>{recipe.difficulty}</strong>
                  <small>Difficulty</small>
                </div>
              </div>
            </div>

            <section className="ingredients-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">WHAT YOU NEED</span>
                  <h2>Ingredients</h2>
                </div>
                <span className="date-label">
                  {checkedIngredients.length}/{recipe.ingredients.length} selected
                </span>
              </div>

              <div className="servings-control">
                <span>Servings</span>
                <div>
                  <button
                    aria-label="Decrease servings"
                    disabled={servings <= 1}
                    onClick={() => setServings((value) => Math.max(1, value - 1))}
                  >
                    −
                  </button>
                  <strong>{servings}</strong>
                  <button
                    aria-label="Increase servings"
                    onClick={() => setServings((value) => value + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="ingredient-list">
                {recipe.ingredients.map((ingredient, index) => (
                  <label
                    key={ingredient.name}
                    className="ingredient-item"
                  >
                    <input
                      type="checkbox"
                      checked={checkedIngredients.includes(index)}
                      onChange={() => toggleIngredient(index)}
                    />
                    <span>{ingredient.name}</span>
                    <small>{ingredient.quantity}</small>
                  </label>
                ))}
              </div>

              <button
                className="primary-button full-button"
                onClick={() =>
                  alert("Shopping list integration will be connected later.")
                }
              >
                + Add ingredients to shopping list
              </button>
            </section>
          </div>

          <aside className="instructions-section">
            <span className="eyebrow">LET'S GET COOKING</span>
            <h2>Step-by-step instructions</h2>

            {recipe.instructions.map((instruction, index) => (
              <div className="instruction-item" key={index}>
                <span>{index + 1}</span>
                <p>{instruction}</p>
              </div>
            ))}
          </aside>
        </div>
      </main>
    </>
  );
}
