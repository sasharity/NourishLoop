"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useFavorites } from "@/components/FavoritesProvider";
import type { Recipe } from "@/data/recipes";
import { createClient } from "@/lib/supabase/client";

const filterPills = [
  { label: "All Recipes", href: "/recipes", active: true },
  { label: "High Protein", href: "/recipes?q=protein", active: false },
  { label: "Under 25 mins", href: "/recipes", active: false },
];

export default function HomePage() {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [firstName, setFirstName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const supabase = createClient();

    const [userRes, recipesRes] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from("recipes").select("*"),
    ]);

    const user = userRes.data.user;
    const name = (user?.user_metadata?.first_name as string | undefined) ?? "";
    setFirstName(name);

    if (!recipesRes.error && recipesRes.data) {
      const formatted = recipesRes.data.map((row) => ({
        ...row,
        prepTime: row.prepTime ?? row.prep_time ?? 0,
        cookTime: row.cookTime ?? row.cook_time ?? 0,
        ingredients: [],
        instructions: [],
      })) as Recipe[];

      // Shuffle once on load for Curated & Trending
      const shuffled = [...formatted].sort(() => Math.random() - 0.5);
      setRecipes(shuffled);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => loadData());
  }, [loadData]);

  const curatedRecipes = useMemo(() => recipes.slice(0, 4), [recipes]);
  const trendingRecipes = useMemo(() => recipes.slice(4, 7), [recipes]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Breakfast: 0,
      Lunch: 0,
      Dinner: 0,
      Snack: 0,
    };
    recipes.forEach((r) => {
      if (r.category && counts[r.category] !== undefined) {
        counts[r.category] += 1;
      }
    });
    return counts;
  }, [recipes]);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/recipes?q=${encodeURIComponent(q)}` : "/recipes");
  }

  return (
    <>
      <Navbar />

      <main className="page-container space-y-8 pb-24 pt-5">
        {/* Greeting & Streak */}
        <section className="flex items-start justify-between gap-4">
          <div>
            <span className="eyebrow">DAILY NOURISHMENT</span>
            <h1 className="mt-1 text-3xl font-bold leading-tight text-emerald-950 sm:text-4xl">
              Good day{firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Your mindful loop is flourishing today.
            </p>
          </div>
          <div className="shrink-0 rounded-full border border-emerald-900/10 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-900 shadow-2xs">
            5-Day Streak
          </div>
        </section>

        {/* Whole-Food Rhythm Banner */}
        <section className="flex items-center justify-between gap-3 rounded-2xl bg-emerald-100/70 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-900 text-sm font-bold text-white">
              ∞
            </div>
            <div>
              <h2 className="text-sm font-bold text-emerald-950">
                Whole-Food Rhythm
              </h2>
              <p className="text-xs text-emerald-900/80">
                {recipes.length} seasonal recipes ready to plan
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-900">
            Balanced
          </span>
        </section>

        {/* Search & Filter Pills */}
        <section className="space-y-3">
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 rounded-full border border-gray-200 bg-white p-1.5 pl-4 shadow-2xs"
          >
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search seasonal recipes..."
              aria-label="Search recipes"
              className="w-full bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-hidden"
            />
            <button
              type="submit"
              aria-label="Search"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-900 text-xs font-bold text-white transition hover:bg-emerald-800"
            >
              →
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {filterPills.map((pill) => (
              <Link
                key={pill.label}
                href={pill.href}
                className={
                  pill.active
                    ? "rounded-full bg-emerald-900 px-3.5 py-1.5 text-xs font-semibold text-white"
                    : "rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-700 hover:border-emerald-700"
                }
              >
                {pill.label}
              </Link>
            ))}
          </div>
        </section>

        {/* Curated For You */}
        <section>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-emerald-950">
                Curated For You
              </h2>
              <p className="text-xs text-gray-500">
                Nutrient-dense seasonal dishes crafted for energy
              </p>
            </div>
            <Link
              href="/recipes"
              className="text-xs font-semibold text-emerald-900 hover:underline"
            >
              Explore &gt;
            </Link>
          </div>

          {loading ? (
            <div className="state-card">
              <p>Loading curated recipes...</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {curatedRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xs transition hover:border-emerald-600"
                >
                  <Link href={`/recipes/${recipe.id}`} className="relative block">
                    {recipe.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="h-44 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-44 w-full items-center justify-center bg-emerald-50 text-2xl font-bold text-emerald-800">
                        {recipe.title.slice(0, 1)}
                      </div>
                    )}
                    <span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-white">
                      ★ {recipe.rating ?? 4.8}
                    </span>
                    <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-medium text-white">
                      {(recipe.prepTime || 0) + (recipe.cookTime || 0)} mins
                    </span>
                  </Link>

                  <div className="p-4">
                    <Link
                      href={`/recipes/${recipe.id}`}
                      className="line-clamp-1 text-base font-bold text-emerald-950 hover:underline"
                    >
                      {recipe.title}
                    </Link>
                    <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                      {recipe.description}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-gray-600">
                        <strong>{recipe.calories}</strong> kcal •{" "}
                        <strong>{recipe.protein}g</strong> protein
                      </span>
                      <Link
                        href="/meal-planner"
                        className="rounded-full bg-emerald-900 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-800"
                      >
                        + Plan
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Today's Meal Schedule */}
        <section className="rounded-2xl border border-emerald-900/10 bg-emerald-50/70 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-emerald-950">
              Today&apos;s Meal Schedule
            </h2>
            <span className="text-xs font-semibold text-emerald-800">
              Weekly Planner
            </span>
          </div>

          <p className="mb-4 text-xs text-gray-600">
            Keep your breakfast, lunch, and dinner organized for the week ahead.
          </p>

          <Link
            href="/meal-planner"
            className="flex w-full items-center justify-center rounded-xl bg-white py-2.5 text-xs font-semibold text-emerald-950 shadow-2xs transition hover:bg-emerald-100"
          >
            View Full Week Schedule →
          </Link>
        </section>

        {/* Explore by Meal */}
        <section>
          <div className="mb-3">
            <h2 className="text-xl font-bold text-emerald-950">
              Explore by Meal
            </h2>
            <p className="text-xs text-gray-500">
              Designed around your metabolic flow
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { name: "Breakfast", label: "Breakfast" },
              { name: "Lunch", label: "Lunch" },
              { name: "Dinner", label: "Dinner" },
              { name: "Snack", label: "Snacks" },
            ].map((cat) => (
              <Link
                key={cat.name}
                href={`/recipes?category=${encodeURIComponent(cat.name)}`}
                className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-emerald-600"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-900">
                  {cat.label.slice(0, 1)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-950">
                    {cat.label}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {categoryCounts[cat.name] ?? 0} recipes
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Trending This Week */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-emerald-950">
                Trending This Week
              </h2>
              <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-semibold text-orange-700">
                Hot
              </span>
            </div>
            <Link
              href="/recipes"
              className="text-xs font-semibold text-emerald-900 hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {trendingRecipes.map((recipe) => {
              const saved = isFavorite(recipe.id);
              return (
                <div
                  key={recipe.id}
                  className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-2xs"
                >
                  <Link href={`/recipes/${recipe.id}`} className="shrink-0">
                    {recipe.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-50 font-bold text-emerald-800">
                        {recipe.title.slice(0, 1)}
                      </div>
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span className="font-medium text-emerald-800">
                        Prep {recipe.prepTime || 10}m
                      </span>
                      <span>★ {recipe.rating ?? 4.8}</span>
                    </div>
                    <Link
                      href={`/recipes/${recipe.id}`}
                      className="mt-0.5 block truncate text-sm font-bold text-emerald-950 hover:underline"
                    >
                      {recipe.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {recipe.calories} kcal • {recipe.protein}g Protein
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFavorite(recipe.id)}
                    aria-label={saved ? "Remove from favorites" : "Save to favorites"}
                    className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                      saved
                        ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                        : "border-gray-200 text-gray-500 hover:border-emerald-600"
                    }`}
                  >
                    {saved ? "Saved" : "Save"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Philosophy Quote */}
        <section className="rounded-2xl bg-stone-200/60 p-6 text-center">
          <p className="mx-auto max-w-md text-xs italic text-gray-600">
            &ldquo;Let nourishment be an act of quiet self-respect, never an
            obligation.&rdquo;
          </p>
          <p className="mt-2 text-xs font-semibold text-emerald-900">
            — Nourish Loop Philosophy
          </p>
        </section>
      </main>
    </>
  );
}
