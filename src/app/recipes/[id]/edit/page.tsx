
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

type IngredientInput = {
  name: string;
  quantity: string;
  unit: string;
};

export default function EditRecipePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Breakfast");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [prepTime, setPrepTime] = useState("10");
  const [cookTime, setCookTime] = useState("15");
  const [servings, setServings] = useState("2");
  const [difficulty, setDifficulty] = useState("Easy");

  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  const [ingredients, setIngredients] = useState<IngredientInput[]>([]);
  const [instructions, setInstructions] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loadError, setLoadError] = useState("");

  // Load existing recipe from Supabase
  useEffect(() => {
    async function loadRecipe() {
      try {
        const { data: recipe, error } = await supabase
          .from("recipes")
          .select("*")
          .eq("id", params.id)
          .maybeSingle();

        if (error) throw error;

        if (!recipe) {
          setLoadError("Recipe not found.");
          return;
        }

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

        if (ingredientsResult.error) {
          throw ingredientsResult.error;
        }

        if (instructionsResult.error) {
          throw instructionsResult.error;
        }

        setTitle(recipe.title);
        setCategory(recipe.category);
        setDescription(recipe.description ?? "");
        setImage(recipe.image ?? "");
        setPrepTime(String(recipe.prep_time));
        setCookTime(String(recipe.cook_time));
        setServings(String(recipe.servings ?? 1));
        setDifficulty(recipe.difficulty ?? "Easy");

        setCalories(String(recipe.calories ?? ""));
        setProtein(String(recipe.protein ?? ""));
        setCarbs(String(recipe.carbs ?? ""));
        setFat(String(recipe.fat ?? ""));

        setIngredients(
          ingredientsResult.data.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
          }))
        );

        setInstructions(
          instructionsResult.data.map(
            (item) => item.instruction
          )
        );
      } catch (error) {
        console.error("Error loading recipe:", error);
        setLoadError("Unable to load recipe. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadRecipe();
  }, [params.id]);

  // Update ingredient fields
  function updateIngredient(
    index: number,
    field: keyof IngredientInput,
    value: string
  ) {
    setIngredients((current) =>
      current.map((ingredient, i) =>
        i === index
          ? { ...ingredient, [field]: value }
          : ingredient
      )
    );
  }

  // Add ingredient
  function addIngredient() {
    setIngredients((current) => [
      ...current,
      { name: "", quantity: "", unit: "" },
    ]);
  }

  // Remove ingredient
  function removeIngredient(index: number) {
    setIngredients((current) =>
      current.filter((_, i) => i !== index)
    );
  }

  // Add instruction
  function addInstruction() {
    setInstructions((current) => [...current, ""]);
  }

  // Update instruction
  function updateInstruction(index: number, value: string) {
    setInstructions((current) =>
      current.map((instruction, i) =>
        i === index ? value : instruction
      )
    );
  }

  // Remove instruction
  function removeInstruction(index: number) {
    setInstructions((current) =>
      current.filter((_, i) => i !== index)
    );
  }

  // Save updated recipe
  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    const validIngredients = ingredients.filter(
      (item) =>
        item.name.trim() !== "" &&
        Number(item.quantity) > 0 &&
        item.unit.trim() !== ""
    );

    if (
      validIngredients.length === 0 ||
      validIngredients.length !== ingredients.length
    ) {
      setErrorMessage("Please complete all ingredient rows.");
      return;
    }

    const validInstructions = instructions.filter(
      (item) => item.trim() !== ""
    );

    if (
      validInstructions.length === 0 ||
      validInstructions.length !== instructions.length
    ) {
      setErrorMessage("Please complete all instruction steps.");
      return;
    }

    setSaving(true);

    try {
      // 1. Update recipe details
      const { error: recipeError } = await supabase
        .from("recipes")
        .update({
          title: title.trim(),
          category,
          description: description.trim() || null,
          image: image.trim() || null,
          prep_time: Number(prepTime),
          cook_time: Number(cookTime),
          servings: Number(servings),
          difficulty,
          calories: Number(calories) || 0,
          protein: Number(protein) || 0,
          carbs: Number(carbs) || 0,
          fat: Number(fat) || 0,
        })
        .eq("id", params.id);

      if (recipeError) throw recipeError;

      // 2. Delete existing ingredients
      const { error: deleteIngredientsError } = await supabase
        .from("ingredients")
        .delete()
        .eq("recipe_id", params.id);

      if (deleteIngredientsError) {
        throw deleteIngredientsError;
      }

      // 3. Insert updated ingredients
      const { error: insertIngredientsError } = await supabase
        .from("ingredients")
        .insert(
          validIngredients.map((item) => ({
            recipe_id: params.id,
            name: item.name.trim(),
            quantity: item.quantity,
            unit: item.unit,
          }))
        );

      if (insertIngredientsError) {
        throw insertIngredientsError;
      }

      // 4. Delete existing instructions
      const { error: deleteInstructionsError } = await supabase
        .from("instructions")
        .delete()
        .eq("recipe_id", params.id);

      if (deleteInstructionsError) {
        throw deleteInstructionsError;
      }

      // 5. Insert updated instructions
      const { error: insertInstructionsError } = await supabase
        .from("instructions")
        .insert(
          validInstructions.map((item, index) => ({
            recipe_id: params.id,
            step_number: index + 1,
            instruction: item.trim(),
          }))
        );

      if (insertInstructionsError) {
        throw insertInstructionsError;
      }

      // 6. Show success message before redirecting
  setSuccessMessage("Recipe updated successfully!");
          
setTimeout(() => {
  router.push(`/recipes/${params.id}`);
  router.refresh();
}, 2000);

    } catch (error) {
      console.error("Error updating recipe:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update recipe. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <main className="page-container">
        <p>Loading recipe...</p>
      </main>
    );
  }

  // Recipe loading error
  if (loadError) {
    return (
      <>
        <Navbar />

        <main className="page-container">
          <p className="error-message">{loadError}</p>

          <Link href="/recipes" className="text-link">
            Return to recipes
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="page-container">
        <Link
          href={`/recipes/${params.id}`}
          className="back-link"
        >
          ← Back to recipe
        </Link>

        <form className="recipe-form" onSubmit={handleSubmit}>
          <h1>Edit Recipe</h1>

          <h2>Recipe Information</h2>

          <label>Recipe Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Breakfast</option>
            <option>Lunch</option>
            <option>Dinner</option>
            <option>Snacks</option>
            <option>Desserts</option>
          </select>

          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label>Image URL</label>
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />

          <h2>Cooking Details</h2>

          <label>Preparation Time (minutes)</label>
          <input
            type="number"
            min="0"
            value={prepTime}
            onChange={(e) => setPrepTime(e.target.value)}
            required
          />

          <label>Cooking Time (minutes)</label>
          <input
            type="number"
            min="0"
            value={cookTime}
            onChange={(e) => setCookTime(e.target.value)}
            required
          />

          <label>Servings</label>
          <input
            type="number"
            min="1"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            required
          />

          <label>Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>

          <h2>Nutrition Information</h2>

          <label>Calories</label>
          <input
            type="number"
            min="0"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
          />

          <label>Protein (g)</label>
          <input
            type="number"
            min="0"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
          />

          <label>Carbs (g)</label>
          <input
            type="number"
            min="0"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
          />

          <label>Fat (g)</label>
          <input
            type="number"
            min="0"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
          />

          <h2>Ingredients</h2>

          {ingredients.map((ingredient, index) => (
            <div key={index}>
              <label>Ingredient Name</label>
              <input
                value={ingredient.name}
                onChange={(e) =>
                  updateIngredient(index, "name", e.target.value)
                }
                required
              />

              <label>Quantity</label>
              <input
                type="number"
                min="0.01"
                step="any"
                value={ingredient.quantity}
                onChange={(e) =>
                  updateIngredient(index, "quantity", e.target.value)
                }
                required
              />

              <label>Unit</label>
              <input
                value={ingredient.unit}
                onChange={(e) =>
                  updateIngredient(index, "unit", e.target.value)
                }
                required
              />

              <button
                type="button"
                onClick={() => removeIngredient(index)}
              >
                Remove Ingredient
              </button>
            </div>
          ))}

          <button type="button" onClick={addIngredient}>
            + Add Ingredient
          </button>

          <h2>Cooking Instructions</h2>
          <button type="button" onClick={addInstruction}>
            + Add Instruction
         </button>

          {instructions.map((instruction, index) => (
            <div key={index}>
              <label>Step {index + 1}</label>

              <textarea
                value={instruction}
                onChange={(e) =>
                  updateInstruction(index, e.target.value)
                }
                required
              />

              {instructions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeInstruction(index)}
                >
                  Remove Step
                </button>
              )}
            </div>
          ))}

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Saving Changes..." : "Update Recipe"}
            </button>

            <Link
              href={`/recipes/${params.id}`}
              className="text-link"
            >
              Cancel
            </Link>
          </div>

          {successMessage && (
            <p className="success-message">
              {successMessage}
            </p>
          )}

          {errorMessage && (
            <p className="error-message">
              {errorMessage}
            </p>
          )}
        </form>
      </main>
    </>
  );
}
