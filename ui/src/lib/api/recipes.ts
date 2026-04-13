import type {
	CreateRecipePayload,
	RecipeMutationResponse,
	GetRecipesResponse,
} from "@/lib/types/recipe";
import { GENERIC_ERROR } from "../content-strings";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? window.location.origin).replace(/\/$/, "");

export async function getRecipes() {
	const response = await fetch(`${apiBaseUrl}/recipes`, {
		credentials: "include",
	});

	const data = (await response.json().catch(() => null)) as GetRecipesResponse | null;

	if (!response.ok) {
		throw new Error(data?.message ?? GENERIC_ERROR);
	}

	return data?.recipes ?? [];
}

export async function createRecipe(payload: CreateRecipePayload) {
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
