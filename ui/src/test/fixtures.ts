import type { Ingredient } from "@recipe-book/shared/types/ingredient";
import type { Recipe, RecipeIngredient } from "@recipe-book/shared/types/recipe";

export const recipeIngredientPastaIngredientId = "dbeeba7e-fd28-4343-9ba1-f2d645ec5445";
export const recipeIngredientPastaRecipeId = "67a35cd7-3667-431f-abba-dc7cc71ada12";

export const ingredientBread: Ingredient = {
	id: "dd225f36-f51c-48a3-b980-9b71cee9ab16",
	name: "bread",
	purchaseUnit: "GRAM",
	costPerUnit: "0.1",
};

export const ingredientCheddarCheese: Ingredient = {
	id: "f4fc2190-f19a-48bf-b081-ae8ed6c66cf5",
	name: "cheddar cheese",
	purchaseUnit: "PACK",
	costPerUnit: "3.99",
};

export const ingredientFlour: Ingredient = {
	id: "322af843-707f-4ebd-acba-071dc296db80",
	name: "flour",
	purchaseUnit: "KILOGRAM",
	costPerUnit: "1.89",
};

export const ingredientWater: Ingredient = {
	id: "f70b91ab-b8fc-476d-be63-480c005264e5",
	name: "water",
	purchaseUnit: "GRAM",
	costPerUnit: "0.1",
};

export const ingredientPasta: Ingredient = {
	id: recipeIngredientPastaIngredientId,
	name: "Pasta",
	purchaseUnit: "KILOGRAM",
	costPerUnit: "9.99",
};

export const ingredients: Ingredient[] = [
	{
		...ingredientBread,
	},
	{
		...ingredientCheddarCheese,
	},
	{
		...ingredientFlour,
	},
	{
		...ingredientWater,
	},
];

export const recipeIngredientFlour: RecipeIngredient = {
	createdAt: "2026-05-26T21:40:52.547Z",
	id: "71cc3200-2d30-41fb-9088-ced7c5f87c34",
	ingredient: {
		id: "322af843-707f-4ebd-acba-071dc296db80",
		name: "flour",
	},
	ingredientId: "322af843-707f-4ebd-acba-071dc296db80",
	quantity: 400,
	recipeId: "87e9b288-d9c1-4ce8-81f9-ddf406a20dc6",
	unit: "GRAM",
	updatedAt: "2026-05-26T21:40:52.547Z",
	userId: "4a888465-46e0-4feb-bc55-eaccb755a88d",
};

export const recipeIngredientWater: RecipeIngredient = {
	createdAt: "2026-05-26T21:40:52.547Z",
	id: "1a31740f-15ed-43f6-9069-fc8176b50473",
	ingredient: {
		id: "f70b91ab-b8fc-476d-be63-480c005264e5",
		name: "water",
	},
	ingredientId: "f70b91ab-b8fc-476d-be63-480c005264e5",
	quantity: 200,
	recipeId: "87e9b288-d9c1-4ce8-81f9-ddf406a20dc6",
	unit: "GRAM",
	updatedAt: "2026-05-26T21:40:52.547Z",
	userId: "4a888465-46e0-4feb-bc55-eaccb755a88d",
};

export const recipeIngredientBread: RecipeIngredient = {
	createdAt: "2026-05-22T20:21:30.249Z",
	id: "dbbafac9-641a-439b-8698-81a7638e4b95",
	ingredient: {
		id: "dd225f36-f51c-48a3-b980-9b71cee9ab16",
		name: "bread",
	},
	ingredientId: "dd225f36-f51c-48a3-b980-9b71cee9ab16",
	quantity: 1,
	recipeId: "46bbee49-9d6c-4ebb-a71b-a40162393fce",
	unit: "UNIT",
	updatedAt: "2026-05-22T20:21:30.249Z",
	userId: "4a888465-46e0-4feb-bc55-eaccb755a88d",
};

export const recipeIngredientCheddarCheese: RecipeIngredient = {
	createdAt: "2026-05-22T20:21:30.249Z",
	id: "a733f231-c260-40cc-b4b3-cd451c4505b6",
	ingredient: {
		id: "f4fc2190-f19a-48bf-b081-ae8ed6c66cf5",
		name: "cheddar cheese",
	},
	ingredientId: "f4fc2190-f19a-48bf-b081-ae8ed6c66cf5",
	quantity: 29.96,
	recipeId: "46bbee49-9d6c-4ebb-a71b-a40162393fce",
	unit: "GRAM",
	updatedAt: "2026-05-22T20:21:30.249Z",
	userId: "4a888465-46e0-4feb-bc55-eaccb755a88d",
};

export const recipeIngredientPasta: RecipeIngredient = {
	createdAt: "2026-05-22T20:21:30.249Z",
	id: "3fd9fdc2-ba03-4763-afd2-4c11f760a7cc",
	ingredient: {
		id: recipeIngredientPastaIngredientId,
		name: "pasta",
	},
	ingredientId: recipeIngredientPastaIngredientId,
	quantity: 9.99,
	recipeId: recipeIngredientPastaRecipeId,
	unit: "KILOGRAM",
	updatedAt: "2026-05-22T20:28:46.385Z",
	userId: "4a888465-46e0-4feb-bc55-eaccb755a88d",
};

export const recipeIngredients: RecipeIngredient[] = [
	{
		...recipeIngredientFlour,
	},
	{
		...recipeIngredientWater,
	},
	{
		...recipeIngredientBread,
	},
	{
		...recipeIngredientCheddarCheese,
	},
];

export const recipeCaek: Recipe = {
	cookTime: 1,
	cookTimeUnit: "MINUTES",
	createdAt: "2026-05-26T21:40:52.524Z",
	id: "87e9b288-d9c1-4ce8-81f9-ddf406a20dc6",
	ingredients: [
		{
			...recipeIngredients[0],
		},
	],
	method: "now is time for caek",
	name: "caek",
	portions: 1,
	prepTime: 1,
	prepTimeUnit: "MINUTES",
	shelfLife: 1,
	shelfLifeUnit: "DAYS",
	updatedAt: "2026-05-26T21:40:52.524Z",
	userId: "4a888465-46e0-4feb-bc55-eaccb755a88d",
};

export const recipeCheeseOnToast: Recipe = {
	cookTime: 1,
	cookTimeUnit: "MINUTES",
	createdAt: "2026-05-22T20:21:30.236Z",
	id: "46bbee49-9d6c-4ebb-a71b-a40162393fce",
	ingredients: [
		{
			...recipeIngredients[2],
		},
		{
			...recipeIngredients[3],
		},
	],
	method: "1. bread\n2. cheese\n3. grill",
	name: "cheese on toast",
	portions: 1,
	prepTime: 1,
	prepTimeUnit: "MINUTES",
	shelfLife: 1,
	shelfLifeUnit: "DAYS",
	updatedAt: "2026-05-22T20:21:30.236Z",
	userId: "4a888465-46e0-4feb-bc55-eaccb755a88d",
};

export const recipes: Recipe[] = [
	{
		...recipeCaek,
	},
	{
		...recipeCheeseOnToast,
	},
];
