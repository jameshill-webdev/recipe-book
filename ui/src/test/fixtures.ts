import type { ResponseRecipe } from "@recipe-book/shared/types/recipe";

export const responseIngredient = {
	id: "f5862018-e943-46e0-9409-d59b36f1f0a2",
	createdAt: "2026-05-30T23:58:50.919Z",
	updatedAt: "2026-05-30T23:58:50.919Z",
	userId: "4a888465-46e0-4feb-bc55-eaccb755a88d",
	recipeId: "9761bd63-615e-48b8-849f-39bf1b7ceb81",
	ingredientId: "30aa9583-9f84-4a6c-8724-dee76afbf595",
	quantity: 1,
	unit: "UNIT",
	ingredient: { id: "30aa9583-9f84-4a6c-8724-dee76afbf595", name: "test response ingredient" },
};

export const responseRecipe: ResponseRecipe = {
	id: "9761bd63-615e-48b8-849f-39bf1b7ceb81",
	createdAt: "2026-05-22T22:10:37.391Z",
	updatedAt: "2026-05-30T23:58:50.941Z",
	userId: "4a888465-46e0-4feb-bc55-eaccb755a88d",
	name: "test response recipe",
	method: "1. toast bread\n2. spread pesto\n3. add mayo\n4. add ham and cheese slice\n5. place bread together",
	prepTime: 5,
	prepTimeUnit: "MINUTES",
	cookTime: 0,
	cookTimeUnit: "MINUTES",
	shelfLife: 1,
	shelfLifeUnit: "DAYS",
	portions: 1,
	ingredients: [
		{
			...responseIngredient,
			ingredient: {
				...responseIngredient.ingredient,
				name: "test response ingredient 1",
			},
		},
		{
			...responseIngredient,
			ingredient: {
				...responseIngredient.ingredient,
				name: "test response ingredient 2",
			},
		},
		{
			...responseIngredient,
			ingredient: {
				...responseIngredient.ingredient,
				name: "test response ingredient 3",
			},
		},
		{
			...responseIngredient,
			ingredient: {
				...responseIngredient.ingredient,
				name: "test response ingredient 4",
			},
		},
	],
};
