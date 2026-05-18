import type { PurchaseUnit } from "../lib/units.ts";

export type IngredientParams = {
	id: string;
};

export type IngredientData = {
	id: string;
	name: string;
	purchaseUnit: PurchaseUnit;
	costPerUnit: string;
};

export type CreateIngredientsPayloadItem = Omit<IngredientData, "id">;

export type CreateIngredientsPayload = {
	ingredients: CreateIngredientsPayloadItem[];
};

export type UpdateIngredientPayload = { id: string } & Partial<CreateIngredientsPayloadItem>;

export type IngredientsMutationResponse = {
	ok: boolean;
	message?: string;
	ingredients?: IngredientData[];
};

export type GetIngredientsResponse = {
	ok: boolean;
	message?: string;
	ingredients?: IngredientData[];
};
