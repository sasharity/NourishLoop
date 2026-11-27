"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import RecipeSelectModal from "@/components/RecipeSelectModal";
import { createClient } from "@/lib/supabase/client";
import type { Recipe } from "@/data/recipes";

const mealTypes = ["Breakfast", "Lunch", "Dinner"] as const;
type MealType = (typeof mealTypes)[number];

type Meal = {
  id: string;
  recipeId: string;
  date: string;
  type: MealType;
};

const STORAGE_KEY = "nourish-loop-meal-plan";

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

function getMonday(date: Date) {
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export default function MealPlannerPage() {
  const [week, setWeek] = useState<Date>(() => getMonday(new Date()));
  const [meals, setMeals] = useState<Meal[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(true);

  // Modal selection state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    date: string;
    type: MealType;
    dayLabel: string;
  } | null>(null);

  // Load recipes from Supabase (fallback to static data if needed)
  useEffect(() => {
    async function loadRecipes() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("recipes")
          .select("*")
          .order("title");

        if (error) {
          console.error("Error loading recipes:", error.message);
        } else if (data && data.length > 0) {
          const formatted = data.map((row) => ({
            id: row.id,
            title: row.title,
            category: row.category,
            image: row.image || "",
            description: row.description || "",
            prepTime: row.prepTime ?? row.prep_time ?? 0,
            cookTime: row.cookTime ?? row.cook_time ?? 0,
            rating: row.rating ?? 0,
            calories: row.calories ?? 0,
            protein: row.protein ?? 0,
            carbs: row.carbs ?? 0,
            fat: row.fat ?? 0,
            difficulty: row.difficulty ?? "Easy",
            servings: row.servings ?? 1,
            ingredients: [],
            instructions: [],
          })) as Recipe[];
          setRecipes(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch recipes from DB:", err);
      } finally {
        setRecipesLoading(false);
      }
    }

    loadRecipes();
  }, []);

  // Save changes to browser storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
    } catch {
      console.error("Could not save meal plan.");
    }
  }, [meals]);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(week);
      date.setDate(week.getDate() + i);
      return date;
    });
  }, [week]);

  function openAddModal(date: string, type: MealType, dayLabel: string) {
    setSelectedSlot({ date, type, dayLabel });
    setModalOpen(true);
  }

  function addMeal(recipeId: string) {
    if (!recipeId || !selectedSlot) return;

    setMeals((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        date: selectedSlot.date,
        type: selectedSlot.type,
        recipeId,
      },
    ]);
  }

  function moveMeal(id: string, date: string, type: MealType) {
    setMeals((current) =>
      current.map((meal) =>
        meal.id === id ? { ...meal, date, type } : meal
      )
    );
  }

  function removeMeal(id: string) {
    setMeals((current) => current.filter((meal) => meal.id !== id));
  }

  const recipeMap = useMemo(() => {
    const map = new Map<string, Recipe>();
    recipes.forEach((r) => map.set(r.id, r));
    return map;
  }, [recipes]);

  return (
    <>
      <Navbar />

      <main className="page-container meal-planner">
        <header className="mb-6">
          <span className="eyebrow">PLAN AHEAD, EAT BETTER</span>
          <h1 className="text-3xl font-bold text-emerald-950">My Meal Planner</h1>
          <p className="text-gray-600">
            Organise your weekly meals from your recipe collection ({recipes.length} available).
          </p>
        </header>

        {/* Week navigation bar */}
        <div className="week-nav mb-6 flex items-center justify-between rounded-xl bg-white p-3 shadow-xs border border-gray-200">
          <button
            onClick={() =>
              setWeek(new Date(week.getFullYear(), week.getMonth(), week.getDate() - 7))
            }
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 transition"
          >
            ← Previous
          </button>
          <strong className="text-sm font-semibold text-emerald-900 sm:text-base">
            {days[0].toLocaleDateString("en", { month: "short", day: "numeric" })}
            {" – "}
            {days[6].toLocaleDateString("en", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </strong>
          <button
            onClick={() =>
              setWeek(new Date(week.getFullYear(), week.getMonth(), week.getDate() + 7))
            }
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 transition"
          >
            Next →
          </button>
        </div>

        {/* Days grid */}
        <div className="space-y-4">
          {days.map((day) => {
            const date = dateKey(day);
            const dayMeals = meals.filter((meal) => meal.date === date);
            const isToday = dateKey(new Date()) === date;

            return (
              <section
                className={`planner-day rounded-2xl border bg-white p-5 shadow-xs transition ${
                  isToday ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-gray-200"
                }`}
                key={date}
              >
                <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-2">
                  <h2 className="text-lg font-bold text-emerald-950">
                    {day.toLocaleDateString("en", { weekday: "long" })}
                    <small className="ml-2 text-xs font-normal text-gray-500">
                      {day.toLocaleDateString("en", { month: "short", day: "numeric" })}
                    </small>
                  </h2>
                  {isToday && (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                      Today
                    </span>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {mealTypes.map((type) => {
                    const slotMeals = dayMeals.filter((meal) => meal.type === type);

                    return (
                      <div
                        className="meal-slot flex flex-col justify-between rounded-xl bg-gray-50/70 p-3.5 border border-gray-100"
                        key={type}
                      >
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-900">
                              {type}
                            </h3>
                            <span className="text-[11px] text-gray-400">
                              {slotMeals.length} item{slotMeals.length === 1 ? "" : "s"}
                            </span>
                          </div>

                          <div className="space-y-2">
                            {slotMeals.map((meal) => {
                              const recipe = recipeMap.get(meal.recipeId);

                              return (
                                <div
                                  className="group flex flex-col rounded-lg border border-gray-200 bg-white p-2.5 shadow-2xs transition hover:border-emerald-400"
                                  key={meal.id}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <Link
                                      href={`/recipes/${meal.recipeId}`}
                                      className="font-medium text-xs text-gray-800 hover:text-emerald-700 hover:underline line-clamp-1"
                                      title={recipe?.title || meal.recipeId}
                                    >
                                      {recipe?.title || "Unknown Recipe"}
                                    </Link>
                                    <button
                                      onClick={() => removeMeal(meal.id)}
                                      aria-label="Remove meal"
                                      className="text-gray-400 hover:text-red-500 font-bold text-sm leading-none"
                                    >
                                      ×
                                    </button>
                                  </div>

                                  <div className="mt-2 flex items-center gap-1.5 text-[11px]">
                                    <select
                                      aria-label="Move meal to day"
                                      value={meal.date}
                                      onChange={(e) =>
                                        moveMeal(meal.id, e.target.value, meal.type)
                                      }
                                      className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 text-xs text-gray-600"
                                    >
                                      {days.map((d) => (
                                        <option key={dateKey(d)} value={dateKey(d)}>
                                          {d.toLocaleDateString("en", { weekday: "short" })}
                                        </option>
                                      ))}
                                    </select>

                                    <select
                                      aria-label="Move meal to meal type"
                                      value={meal.type}
                                      onChange={(e) =>
                                        moveMeal(
                                          meal.id,
                                          meal.date,
                                          e.target.value as MealType
                                        )
                                      }
                                      className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 text-xs text-gray-600"
                                    >
                                      {mealTypes.map((t) => (
                                        <option key={t} value={t}>
                                          {t}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Add recipe button triggers searchable popup modal */}
                        <button
                          type="button"
                          onClick={() =>
                            openAddModal(
                              date,
                              type,
                              `${day.toLocaleDateString("en", {
                                weekday: "long",
                                month: "short",
                                day: "numeric",
                              })}`
                            )
                          }
                          disabled={recipesLoading}
                          className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-emerald-300 bg-emerald-50/50 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 hover:border-emerald-500 disabled:opacity-50"
                        >
                          <span>+</span>
                          <span>Add {type}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {dayMeals.length === 0 && (
                  <p className="mt-2 text-xs text-gray-400">
                    No meals planned for this day.
                  </p>
                )}
              </section>
            );
          })}
        </div>

        <p className="planner-total mt-6 text-right text-xs text-gray-500">
          {meals.filter((meal) => days.some((day) => dateKey(day) === meal.date)).length}{" "}
          meals planned this week
        </p>

        {/* Recipe Selection Modal */}
        {selectedSlot && (
          <RecipeSelectModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onSelect={addMeal}
            recipes={recipes}
            slotType={selectedSlot.type}
            dayLabel={selectedSlot.dayLabel}
          />
        )}
      </main>
    </>
  );
}
