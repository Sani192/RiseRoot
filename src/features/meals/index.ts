import type { FeatureBoundary } from "@/types";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export type MealContext =
  | "quick"
  | "steady-energy"
  | "comfort"
  | "post-workout";

export interface MealSuggestion {
  mealType: MealType;
  context: MealContext;
  title: string;
  description: string;
  prepMinutes: number;
  tags: string[];
}

export const mealSuggestions: readonly MealSuggestion[] = [
  {
    mealType: "breakfast",
    context: "quick",
    title: "Greek yogurt crunch bowl",
    description: "Greek yogurt with berries, walnuts, and a drizzle of honey.",
    prepMinutes: 5,
    tags: ["protein", "no-cook", "sweet"],
  },
  {
    mealType: "breakfast",
    context: "steady-energy",
    title: "Savory egg toast",
    description:
      "Whole-grain toast with eggs, greens, and avocado or olive oil.",
    prepMinutes: 12,
    tags: ["protein", "fiber", "savory"],
  },
  {
    mealType: "lunch",
    context: "quick",
    title: "Hummus wrap plate",
    description:
      "A veggie hummus wrap with fruit and a handful of nuts on the side.",
    prepMinutes: 8,
    tags: ["portable", "plant-forward", "fiber"],
  },
  {
    mealType: "lunch",
    context: "steady-energy",
    title: "Warm grain bowl",
    description:
      "Brown rice or quinoa with greens, chickpeas, roasted vegetables, and tahini.",
    prepMinutes: 18,
    tags: ["balanced", "plant-forward", "make-ahead"],
  },
  {
    mealType: "dinner",
    context: "comfort",
    title: "Sheet-pan comfort dinner",
    description:
      "Salmon, tofu, or chicken with sweet potato, broccoli, and lemony sauce.",
    prepMinutes: 30,
    tags: ["one-pan", "balanced", "warm"],
  },
  {
    mealType: "dinner",
    context: "post-workout",
    title: "Recovery rice bowl",
    description:
      "Rice, beans or lean protein, salsa, greens, and Greek-yogurt lime crema.",
    prepMinutes: 20,
    tags: ["protein", "carbs", "recovery"],
  },
  {
    mealType: "snack",
    context: "quick",
    title: "Apple peanut-butter plate",
    description:
      "Apple slices with peanut butter and cinnamon for an easy grounding snack.",
    prepMinutes: 4,
    tags: ["no-cook", "fiber", "sweet"],
  },
  {
    mealType: "snack",
    context: "post-workout",
    title: "Smoothie reset",
    description:
      "Milk or yogurt blended with banana, berries, spinach, and nut butter.",
    prepMinutes: 6,
    tags: ["recovery", "protein", "drinkable"],
  },
];

export function getMealSuggestions(
  mealType?: MealType,
  context?: MealContext,
): MealSuggestion[] {
  return mealSuggestions.filter(
    (suggestion) =>
      (mealType === undefined || suggestion.mealType === mealType) &&
      (context === undefined || suggestion.context === context),
  );
}

export function getDailyMealPlan(
  context: MealContext = "steady-energy",
): MealSuggestion[] {
  const fallbackContext: MealContext =
    context === "post-workout" ? "steady-energy" : context;

  return (["breakfast", "lunch", "dinner"] as const).map((mealType) => {
    const contextualSuggestion = getMealSuggestions(mealType, context)[0];
    const fallbackSuggestion = getMealSuggestions(mealType, fallbackContext)[0];
    const defaultSuggestion = getMealSuggestions(mealType)[0];
    const suggestion =
      contextualSuggestion ?? fallbackSuggestion ?? defaultSuggestion;

    if (!suggestion) {
      throw new Error(`No meal suggestion is configured for ${mealType}.`);
    }

    return suggestion;
  });
}

export const mealsFeature: FeatureBoundary = {
  name: "Meals",
  phase: "phase-1",
  status: "ready",
};
