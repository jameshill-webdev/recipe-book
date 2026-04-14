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

export type CreateIngredientPayload = Omit<IngredientData, "id">;

export type UpdateIngredientPayload = { id: string } & Partial<CreateIngredientPayload>;

export type IngredientMutationResponse = {
	ok: boolean;
	message?: string;
	ingredient?: IngredientData;
};

export type GetIngredientsResponse = {
	ok: boolean;
	message?: string;
	ingredients?: IngredientData[];
};
