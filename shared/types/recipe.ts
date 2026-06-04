import type { PurchaseUnit, TimeUnit } from "@recipe-book/shared/lib/units";

export interface Duration {
	time: number;
	unit: TimeUnit;
}

export type RecipeIngredient = {
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

export type CreateRecipeIngredientPayload = {
	name: string;
	ingredientId: string;
	quantity: number;
	unit: PurchaseUnit;
};

export interface Recipe {
	id: string;
	createdAt: string;
	updatedAt: string;
	userId: string;
	name: string;
	method: string;
	prepTime: number;
	prepTimeUnit: string;
	cookTime: number;
	cookTimeUnit: string;
	shelfLife: number;
	shelfLifeUnit: string;
	portions: number;
	ingredients: RecipeIngredient[];
}

export type CreateRecipePayload = {
	name: string;
	ingredients: CreateRecipeIngredientPayload[];
	method: string;
	prepTime: Duration;
	cookTime: Duration;
	shelfLife: Duration;
	numberOfPortions: number;
};

export type UpdateRecipePayload = Partial<CreateRecipePayload> & {
	id: string;
};

export type CreateRecipeResponse = {
	ok: boolean;
	message?: string;
	recipe?: Recipe;
};

export type UpdateRecipeResponse = {
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
	recipe?: Recipe;
};
