import type {
	CreateRecipePayload,
	UpdateRecipePayload,
	CreateRecipeResponse,
	GetRecipesResponse,
	GetRecipeByIdResponse,
	Recipe,
	UpdateRecipeResponse,
} from "@recipe-book/shared/types/recipe";
import { GENERIC_ERROR } from "../content-strings";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? window.location.origin).replace(/\/$/, "");

export async function getRecipes(): Promise<Recipe[]> {
	const response = await fetch(`${apiBaseUrl}/recipes`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});

	const data = (await response.json().catch(() => null)) as GetRecipesResponse | null;

	if (!response.ok) {
		throw new Error(data?.message ?? GENERIC_ERROR);
	}

	return data?.recipes ?? [];
}

export async function getRecipeById(recipeId: string): Promise<Recipe | undefined> {
	const response = await fetch(`${apiBaseUrl}/recipes/${recipeId}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});

	const data = (await response.json().catch(() => null)) as GetRecipeByIdResponse | null;

	if (!response.ok) {
		throw new Error(data?.message ?? GENERIC_ERROR);
	}

	return data?.recipe;
}

export async function createRecipe(payload: CreateRecipePayload): Promise<Recipe | undefined> {
	const response = await fetch(`${apiBaseUrl}/recipes`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(payload),
	});

	const data = (await response.json().catch(() => null)) as CreateRecipeResponse | null;

	if (!response.ok) {
		throw new Error(data?.message ?? GENERIC_ERROR);
	}

	return data?.recipe;
}

export async function updateRecipe(payload: UpdateRecipePayload): Promise<Recipe | undefined> {
	const response = await fetch(`${apiBaseUrl}/recipes/${payload.id}`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(payload),
	});

	const data = (await response.json().catch(() => null)) as UpdateRecipeResponse | null;

	if (!response.ok) {
		throw new Error(data?.message ?? GENERIC_ERROR);
	}

	return data?.recipe;
}
