'use client';

import { useState, useMemo } from 'react';
import type { Recipe } from '@/data/recipes';

interface RecipeSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (recipeId: string) => void;
  recipes: Recipe[];
  slotType: string;
  dayLabel: string;
}

export default function RecipeSelectModal({
  isOpen,
  onClose,
  onSelect,
  recipes,
  slotType,
  dayLabel,
}: RecipeSelectModalProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = useMemo(() => {
    const set = new Set<string>();
    recipes.forEach((r) => {
      if (r.category) set.add(r.category);
    });
    return ['All', ...Array.from(set)];
  }, [recipes]);

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      const matchesSearch =
        search.trim() === '' ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.description?.toLowerCase().includes(search.toLowerCase());

      const matchesCat =
        selectedCategory === 'All' ||
        r.category?.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCat;
    });
  }, [recipes, search, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Add Recipe to {slotType}
            </h2>
            <p className="text-xs text-gray-500">{dayLabel}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Filters */}
        <div className="space-y-3 border-b border-gray-100 p-5 pb-4">
          <input
            type="search"
            placeholder="Search through recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-green-600 focus:outline-hidden"
            autoFocus
          />

          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-emerald-800 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Recipe List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <p className="text-sm font-medium">No recipes found matching your filter.</p>
            </div>
          ) : (
            filtered.map((r) => (
              <div
                key={r.id}
                onClick={() => {
                  onSelect(r.id);
                  onClose();
                }}
                className="group flex cursor-pointer items-center gap-4 rounded-xl border border-gray-100 p-3 transition hover:border-emerald-600 hover:bg-emerald-50/40"
              >
                {r.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.image}
                    alt={r.title}
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-emerald-100 text-lg font-bold text-emerald-800">
                    {r.title.slice(0, 1)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-gray-800 group-hover:text-emerald-900">
                      {r.title}
                    </span>
                    {r.category && (
                      <span className="shrink-0 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                        {r.category}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                    {r.calories ? <span>{r.calories} kcal</span> : null}
                    {(r.prepTime || r.cookTime) ? (
                      <span>{(r.prepTime || 0) + (r.cookTime || 0)} mins</span>
                    ) : null}
                    {r.difficulty ? <span>{r.difficulty}</span> : null}
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white opacity-90 transition group-hover:opacity-100"
                >
                  Select
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
