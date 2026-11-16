
export type Ingredient = {
  name: string;
  quantity: string;
};

export type Recipe = {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  prepTime: number;
  cookTime: number;
  rating: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  difficulty: string;
  servings: number;
  ingredients: Ingredient[];
  instructions: string[];
};

export const recipes: Recipe[] = [
  {
    id: "salmon-bowl",
    title: "Charred Citrus Wild Salmon Bowl",
    category: "Lunch",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=900",
    description:
      "A fresh and balanced salmon bowl with citrus, avocado, greens and a light homemade dressing.",
    prepTime: 10,
    cookTime: 15,
    rating: 4.9,
    calories: 420,
    protein: 38,
    carbs: 32,
    fat: 18,
    difficulty: "Easy",
    servings: 2,
    ingredients: [
      { name: "Wild salmon fillets", quantity: "2 fillets" },
      { name: "Mixed wild rice", quantity: "1 cup" },
      { name: "Cherry tomatoes", quantity: "1 cup" },
      { name: "Ripe avocado", quantity: "1 whole" },
      { name: "Fresh orange", quantity: "1 fruit" },
      { name: "Olive oil", quantity: "2 tbsp" },
      { name: "Fresh lime juice", quantity: "1 tbsp" },
    ],
    instructions: [
      "Prepare the rice according to the package instructions.",
      "Season the salmon with salt, pepper and a little olive oil.",
      "Pan-sear the salmon until cooked through and lightly charred.",
      "Slice the avocado and tomatoes.",
      "Arrange the rice, salmon and vegetables in serving bowls.",
      "Finish with fresh citrus juice and serve.",
    ],
  },
  {
    id: "avocado-toast",
    title: "Sourdough Avocado Tartine",
    category: "Breakfast",
    image:
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=900",
    description:
      "Toasted sourdough topped with creamy avocado, fresh greens and a touch of citrus.",
    prepTime: 8,
    cookTime: 5,
    rating: 4.8,
    calories: 310,
    protein: 12,
    carbs: 34,
    fat: 15,
    difficulty: "Easy",
    servings: 1,
    ingredients: [
      { name: "Sourdough bread", quantity: "2 slices" },
      { name: "Ripe avocado", quantity: "1 whole" },
      { name: "Lemon juice", quantity: "1 tsp" },
      { name: "Fresh spinach", quantity: "1 handful" },
      { name: "Black pepper", quantity: "To taste" },
    ],
    instructions: [
      "Toast the sourdough bread until golden.",
      "Mash the avocado with lemon juice and black pepper.",
      "Spread the avocado over the toast.",
      "Top with fresh spinach and serve.",
    ],
  },
  {
    id: "grilled-chicken",
    title: "Mediterranean Herb-Grilled Chicken",
    category: "Dinner",
    image:
      "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=900",
    description:
      "Tender grilled chicken served with fresh greens and Mediterranean herbs.",
    prepTime: 15,
    cookTime: 20,
    rating: 4.7,
    calories: 390,
    protein: 42,
    carbs: 18,
    fat: 16,
    difficulty: "Medium",
    servings: 2,
    ingredients: [
      { name: "Chicken breast", quantity: "2 pieces" },
      { name: "Olive oil", quantity: "2 tbsp" },
      { name: "Garlic", quantity: "2 cloves" },
      { name: "Mixed greens", quantity: "2 cups" },
      { name: "Dried oregano", quantity: "1 tsp" },
    ],
    instructions: [
      "Mix olive oil, garlic and oregano.",
      "Coat the chicken with the herb mixture.",
      "Grill until fully cooked.",
      "Serve with fresh mixed greens.",
    ],
  },
  {
    id: "berry-smoothie",
    title: "Wild Blueberry Chia Smoothie",
    category: "Snacks",
    image:
      "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=900",
    description:
      "A refreshing blueberry smoothie blended with chia seeds and creamy yoghurt.",
    prepTime: 5,
    cookTime: 0,
    rating: 4.8,
    calories: 220,
    protein: 10,
    carbs: 30,
    fat: 7,
    difficulty: "Easy",
    servings: 1,
    ingredients: [
      { name: "Blueberries", quantity: "1 cup" },
      { name: "Greek yoghurt", quantity: "1/2 cup" },
      { name: "Chia seeds", quantity: "1 tbsp" },
      { name: "Milk", quantity: "1/2 cup" },
    ],
    instructions: [
      "Add all ingredients to a blender.",
      "Blend until smooth.",
      "Pour into a glass and serve immediately.",
    ],
  },
];

export function getRecipeById(id: string) {
  return recipes.find((recipe) => recipe.id === id);
}
