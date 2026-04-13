import type { PurchaseUnit } from "@recipe-book/shared/lib/purchase-units";

export interface Duration {
	time: number;
	unit: "seconds" | "minutes" | "hours" | "days";
}

export interface RecipeIngredient {
	ingredientId: string;
	name: string;
	quantity: number;
	unit: PurchaseUnit;
}

export interface Recipe {
	id: string;
	name: string;
	ingredients: RecipeIngredient[];
	method: string;
	prepTime: Duration;
	cookTime: Duration;
	shelfLife: Duration;
	numberOfPortions: number;
	costPerPortion: number | string;
}

export type CreateRecipePayload = Omit<Recipe, "id">;

export type RecipeMutationResponse = {
	ok: boolean;
	message?: string;
	recipe?: Recipe;
};

export type GetRecipesResponse = {
	ok: boolean;
	message?: string;
	recipes?: Recipe[];
};
