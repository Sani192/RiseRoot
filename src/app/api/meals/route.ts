import { NextRequest } from "next/server";
import { getMealSuggestions } from "@/features/meals";
import { withApiHandler, parseWithSchema } from "@/lib/api/response";
import { z } from "zod";

const querySchema = z.object({
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
  context: z.enum(["quick", "steady-energy", "comfort", "post-workout"]).optional(),
}).strict();

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const query = parseWithSchema({ mealType: request.nextUrl.searchParams.get("mealType") ?? undefined, context: request.nextUrl.searchParams.get("context") ?? undefined }, querySchema, "query");
    return getMealSuggestions(query.mealType, query.context);
  });
}
