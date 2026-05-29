import type { PurchaseUnit, TimeUnit } from "@recipe-book/shared/lib/units";

export interface Duration {
	time: number;
	unit: TimeUnit;
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

export type GetRecipeByIdResponse = {
	ok: boolean;
	message?: string;
	recipe?: ResponseRecipe;
};

type ResponseIngredient = {
	createdAt: string;
	id: string;
	ingredient: { id: string; name: string };
	ingredientId: string;
	quantity: number;
	recipeId: string;
	unit: string;
	updatedAt: string;
	userId: string;
};

export type ResponseRecipe = Omit<Recipe, "ingredients"> & {
	cookTime: number;
	cookTimeUnit: string;
	createdAt: string;
	id: string;
	ingredients: ResponseIngredient[];
	method: string;
	name: string;
	portions: 1;
	prepTime: 1;
	prepTimeUnit: string;
	shelfLifeDays: 1;
	updatedAt: string;
	userId: string;
};
