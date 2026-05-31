import type {
	CreateRecipePayload,
	UpdateRecipePayload,
	RecipeMutationResponse,
	GetRecipesResponse,
	GetRecipeByIdResponse,
	ResponseRecipe,
} from "@recipe-book/shared/types/recipe";
import { GENERIC_ERROR } from "../content-strings";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? window.location.origin).replace(/\/$/, "");

export async function getRecipes() {
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

export async function getRecipeById(recipeId: string): Promise<ResponseRecipe | undefined> {
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

export async function createRecipe(payload: CreateRecipePayload) {
	console.log("Creating recipe with payload:", payload); // Debug log to check payload structure
	const response = await fetch(`${apiBaseUrl}/recipes`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(payload),
	});

	const data = (await response.json().catch(() => null)) as RecipeMutationResponse | null;

	if (!response.ok) {
		throw new Error(data?.message ?? GENERIC_ERROR);
	}

	return data;
}

export async function updateRecipe(payload: UpdateRecipePayload) {
	console.log("Updating recipe with id:", payload.id); // Debug log to check the ID
	const response = await fetch(`${apiBaseUrl}/recipes/${payload.id}`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(payload),
	});

	const data = (await response.json().catch(() => null)) as RecipeMutationResponse | null;

	if (!response.ok) {
		throw new Error(data?.message ?? GENERIC_ERROR);
	}

	return data;
}
