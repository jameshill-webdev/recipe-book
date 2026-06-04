import type { PurchaseUnit } from "../lib/units.ts";

export type IngredientParams = {
	id: string;
};

export type Ingredient = {
	id: string;
	name: string;
	purchaseUnit: PurchaseUnit;
	costPerUnit: string;
};

export type CreateIngredientsPayloadItem = {
	name: string;
	purchaseUnit: PurchaseUnit;
	costPerUnit: number;
};

export type CreateIngredientsPayload = {
	ingredients: CreateIngredientsPayloadItem[];
};

export type UpdateIngredientPayload = { id: string } & Partial<CreateIngredientsPayloadItem>;

export type CreateIngredientsResponse = {
	ok: boolean;
	message?: string;
	ingredients?: Ingredient[];
};

export type UpdateIngredientResponse = {
	ok: boolean;
	message?: string;
	ingredient?: Ingredient;
};

export type GetIngredientsResponse = {
	ok: boolean;
	message?: string;
	ingredients?: Ingredient[];
};
