import { NextRequest } from "next/server";
import { getMealSuggestions } from "@/features/meals";
import { withApiHandler } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const mealType = request.nextUrl.searchParams.get("mealType") as
      | "breakfast"
      | "lunch"
      | "dinner"
      | "snack"
      | null;
    const context = request.nextUrl.searchParams.get("context") as
      | "quick"
      | "steady-energy"
      | "comfort"
      | "post-workout"
      | null;
    return getMealSuggestions(mealType ?? undefined, context ?? undefined);
  });
}
