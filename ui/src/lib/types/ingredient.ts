export interface Ingredient {
	id: string;
	name: string;
	purchaseUnit: string;
	costPerUnit: number | string;
}

export type CreateIngredientPayload = {
	name: string;
	purchaseUnit: string;
	costPerUnit: number;
};

export type IngredientMutationResponse = {
	ok: boolean;
	message?: string;
	ingredient?: Ingredient;
};

export type GetIngredientsResponse = {
	ok: boolean;
	message?: string;
	ingredients?: Ingredient[];
};
