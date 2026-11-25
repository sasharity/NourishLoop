
"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { recipes } from "@/data/recipes";

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
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

function getMonday(date: Date) {
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export default function MealPlannerPage() {
  const [week, setWeek] = useState(() => getMonday(new Date()));
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setMeals(JSON.parse(saved));
    } catch {
      console.error("Could not load meal plan.");
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
    }
  }, [meals, loaded]);

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(week);
    date.setDate(week.getDate() + i);
    return date;
  });

  function addMeal(date: string, type: MealType, recipeId: string) {
    if (!recipeId) return;

    setMeals((current) => [
      ...current,
      { id: crypto.randomUUID(), date, type, recipeId },
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

  if (!loaded) return <p>Loading planner...</p>;

  return (
    <>
      <Navbar />

      <main className="page-container meal-planner">
        <header>
          <span className="eyebrow">PLAN AHEAD, EAT BETTER</span>
          <h1>My Meal Planner</h1>
          <p>Organise your meals for the week.</p>
        </header>

        <div className="week-nav">
          <button onClick={() => setWeek(new Date(week.getFullYear(), week.getMonth(), week.getDate() - 7))}>
            ← Previous
          </button>
          <strong>
            {days[0].toLocaleDateString("en", { month: "short", day: "numeric" })}
            {" – "}
            {days[6].toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
          </strong>
          <button onClick={() => setWeek(new Date(week.getFullYear(), week.getMonth(), week.getDate() + 7))}>
            Next →
          </button>
        </div>

        {days.map((day) => {
          const date = dateKey(day);
          const dayMeals = meals.filter((meal) => meal.date === date);

          return (
            <section className="planner-day" key={date}>
              <h2>
                {day.toLocaleDateString("en", { weekday: "long" })}
                <small> {day.toLocaleDateString("en", { month: "short", day: "numeric" })}</small>
              </h2>

              {mealTypes.map((type) => {
                const slotMeals = dayMeals.filter((meal) => meal.type === type);

                return (
                  <div className="meal-slot" key={type}>
                    <h3>{type}</h3>

                    {slotMeals.map((meal) => {
                      const recipe = recipes.find((item) => item.id === meal.recipeId);
                      if (!recipe) return null;

                      return (
                        <div className="planned-meal" key={meal.id}>
                          <span>{recipe.title}</span>

                          <select
                            aria-label="Move meal to day"
                            value={meal.date}
                            onChange={(e) => moveMeal(meal.id, e.target.value, meal.type)}
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
                            onChange={(e) => moveMeal(meal.id, meal.date, e.target.value as MealType)}
                          >
                            {mealTypes.map((t) => (
                              <option key={t}>{t}</option>
                            ))}
                          </select>

                          <button onClick={() => removeMeal(meal.id)} aria-label="Remove meal">
                            ×
                          </button>
                        </div>
                      );
                    })}

                    <select
                      aria-label={`Add ${type}`}
                      defaultValue=""
                      onChange={(e) => {
                        addMeal(date, type, e.target.value);
                        e.target.value = "";
                      }}
                    >
                      <option value="">+ Add a recipe</option>
                      {recipes.map((recipe) => (
                        <option key={recipe.id} value={recipe.id}>
                          {recipe.title}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}

              {dayMeals.length === 0 && (
                <p className="empty-day">No meals planned for this day.</p>
              )}
            </section>
          );
        })}

        <p className="planner-total">
          {meals.filter((meal) => days.some((day) => dateKey(day) === meal.date)).length} meals planned this week
        </p>
      </main>
    </>
  );
}
