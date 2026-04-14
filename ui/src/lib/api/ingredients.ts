import type {
	CreateIngredientPayload,
	UpdateIngredientPayload,
	IngredientMutationResponse,
	GetIngredientsResponse,
} from "@recipe-book/shared/types/ingredient";
import { GENERIC_ERROR } from "../content-strings";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? window.location.origin).replace(/\/$/, "");

export async function getIngredients() {
	const response = await fetch(`${apiBaseUrl}/ingredients`, {
		credentials: "include",
	});

	const data = (await response.json().catch(() => null)) as GetIngredientsResponse | null;

	if (!response.ok) {
		throw new Error(data?.message ?? GENERIC_ERROR);
	}

	return data?.ingredients ?? [];
}

export async function createIngredient(payload: CreateIngredientPayload) {
	const response = await fetch(`${apiBaseUrl}/ingredients`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(payload),
	});

	const data = (await response.json().catch(() => null)) as IngredientMutationResponse | null;

	if (!response.ok) {
		throw new Error(data?.message ?? GENERIC_ERROR);
	}

	return data;
}

export async function updateIngredient(payload: UpdateIngredientPayload) {
	console.log("Updating ingredient with payload:", payload);

	const response = await fetch(`${apiBaseUrl}/ingredients/${payload.id}`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(payload),
	});

	const data = (await response.json().catch(() => null)) as IngredientMutationResponse | null;

	if (!response.ok) {
		throw new Error(data?.message ?? GENERIC_ERROR);
	}

	return data;
}

export async function deleteIngredient(payload: { id: string }) {
	const response = await fetch(`${apiBaseUrl}/ingredients/${payload.id}`, {
		method: "DELETE",
		credentials: "include",
	});

	const data = (await response.json().catch(() => null)) as IngredientMutationResponse | null;

	if (!response.ok) {
		throw new Error(data?.message ?? GENERIC_ERROR);
	}

	return data;
}
