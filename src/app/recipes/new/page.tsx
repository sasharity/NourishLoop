
"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

type IngredientInput = {
  name: string;
  quantity: string;
  unit: string;
};

export default function NewRecipePage() {
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

  const [ingredients, setIngredients] = useState<IngredientInput[]>([
    { name: "", quantity: "", unit: "" },
  ]);

  const [instructions, setInstructions] = useState([""]);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    const validIngredients = ingredients.filter(
      (ingredient) =>
        ingredient.name.trim() !== "" &&
        Number(ingredient.quantity) > 0 &&
        ingredient.unit !== ""
    );

    if (validIngredients.length === 0) {
      setErrorMessage("Please add at least one complete ingredient.");
      return;
    }

    if (validIngredients.length !== ingredients.length) {
      setErrorMessage(
        "Please complete or remove all unfinished ingredient rows."
      );
      return;
    }

    const validInstructions = instructions.filter(
      (instruction) => instruction.trim() !== ""
    );

    if (validInstructions.length === 0) {
      setErrorMessage("Please add at least one cooking instruction.");
      return;
    }

    if (validInstructions.length !== instructions.length) {
      setErrorMessage(
        "Please complete or remove all empty instruction steps."
      );
      return;
    }

    setSaving(true);

    const recipeId = crypto.randomUUID();

    try {
      // 1. Save recipe details
      const { error: recipeError } = await supabase
        .from("recipes")
        .insert({
          id: recipeId,
          title: title.trim(),
          category,
          image: image.trim() || null,
          description: description.trim() || null,
          prep_time: Number(prepTime),
          cook_time: Number(cookTime),
          servings: Number(servings),
          difficulty,
          calories: calories ? Number(calories) : 0,
          protein: protein ? Number(protein) : 0,
          carbs: carbs ? Number(carbs) : 0,
          fat: fat ? Number(fat) : 0,
        });

      if (recipeError) throw recipeError;

      // 2. Save ingredients
      const { error: ingredientError } = await supabase
        .from("ingredients")
        .insert(
          validIngredients.map((ingredient) => ({
            recipe_id: recipeId,
            name: ingredient.name.trim(),
            quantity: ingredient.quantity,
            unit: ingredient.unit,
          }))
        );

      if (ingredientError) throw ingredientError;

      // 3. Save instructions
      const { error: instructionError } = await supabase
        .from("instructions")
        .insert(
          validInstructions.map((instruction, index) => ({
            recipe_id: recipeId,
            step_number: index + 1,
            instruction: instruction.trim(),
          }))
        );

      if (instructionError) throw instructionError;

      setSuccessMessage("Recipe saved successfully!");
    } catch (error) {
      console.error("Error saving recipe:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving your recipe."
      );
    } finally {
      setSaving(false);
    }
  }

  function addIngredient() {
    setIngredients((current) => [
      ...current,
      { name: "", quantity: "", unit: "" },
    ]);
  }

  function removeIngredient(index: number) {
    setIngredients((current) =>
      current.filter((_, i) => i !== index)
    );
  }

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

  function addInstruction() {
    setInstructions((current) => [...current, ""]);
  }

  function removeInstruction(index: number) {
    setInstructions((current) =>
      current.filter((_, i) => i !== index)
    );
  }

  function updateInstruction(index: number, value: string) {
    setInstructions((current) =>
      current.map((instruction, i) =>
        i === index ? value : instruction
      )
    );
  }

  return (
    <>
      <Navbar />

      <main className="page-container">
        <section className="library-heading">
          <span className="eyebrow">PERSONAL RECIPE EDITOR</span>
          <h1>Create a Recipe</h1>
          <p>Add your own nutritious recipe to NourishLoop.</p>
        </section>

        <form className="recipe-form" onSubmit={handleSubmit}>
          
          <h2>Recipe Information</h2>

          <label>
            Recipe Title
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter recipe name"
              required
            />
          </label>

          <label>
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Breakfast</option>
              <option>Lunch</option>
              <option>Dinner</option>
              <option>Snacks</option>
            </select>
          </label>

          <label>
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your recipe"
              required
            />
          </label>

          <label>
            Image URL
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </label>

          <h2>Cooking Details</h2>

          <label>
            Preparation Time (minutes)
            <input
              type="number"
              min="0"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              required
            />
          </label>

          <label>
            Cooking Time (minutes)
            <input
              type="number"
              min="0"
              value={cookTime}
              onChange={(e) => setCookTime(e.target.value)}
              required
            />
          </label>

          <label>
            Servings
            <input
              type="number"
              min="1"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              required
            />
          </label>

          <label>
            Difficulty
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </label>

          <h2>Nutrition Information</h2>

          <label>
            Calories
            <input
              type="number"
              min="0"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
            />
          </label>

          <label>
            Protein (g)
            <input
              type="number"
              min="0"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
            />
          </label>

          <label>
            Carbohydrates (g)
            <input
              type="number"
              min="0"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
            />
          </label>

          <label>
            Fat (g)
            <input
              type="number"
              min="0"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
            />
          </label>

          <h2>Ingredients</h2>

          {ingredients.map((ingredient, index) => (
            <div key={index}>
              <h3>Ingredient {index + 1}</h3>

              <label>
                Ingredient Name
                <input
                  type="text"
                  value={ingredient.name}
                  onChange={(e) =>
                    updateIngredient(index, "name", e.target.value)
                  }
                  placeholder="e.g. Flour"
                  required
                />
              </label>

              <label>
                Quantity
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={ingredient.quantity}
                  onChange={(e) =>
                    updateIngredient(index, "quantity", e.target.value)
                  }
                  placeholder="e.g. 2"
                  required
                />
              </label>

              <label>
                Unit
                <select
                  value={ingredient.unit}
                  onChange={(e) =>
                    updateIngredient(index, "unit", e.target.value)
                  }
                  required
                >
                  <option value="">Select unit</option>
                  <option value="g">Grams (g)</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="ml">Millilitres (ml)</option>
                  <option value="L">Litres (L)</option>
                  <option value="cups">Cups</option>
                  <option value="tbsp">Tablespoons (tbsp)</option>
                  <option value="tsp">Teaspoons (tsp)</option>
                  <option value="pieces">Pieces</option>
                </select>
              </label>

              {ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                >
                  Remove Ingredient
                </button>
              )}
            </div>
          ))}

          <button type="button" onClick={addIngredient}>
            + Add Ingredient
          </button>

          <h2>Cooking Instructions</h2>

          {instructions.map((instruction, index) => (
            <div key={index}>
              <label>
                Step {index + 1}
                <textarea
                  value={instruction}
                  onChange={(e) =>
                    updateInstruction(index, e.target.value)
                  }
                  placeholder="Describe this cooking step"
                  required
                />
              </label>

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

          <button type="button" onClick={addInstruction}>
            + Add Instruction
          </button>

          <div>
            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving ? "Saving Recipe..." : "Save Recipe"}
            </button>
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


          <Link href="/recipes" className="text-link">
            Cancel and return to recipes
          </Link>
        </form>
      </main>
    </>
  );
}
