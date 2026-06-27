import { z } from "zod";
import {
	CONFIRM_PASSWORD_REQUIRED,
	DISPLAY_NAME_REQUIRED,
	DISPLAY_NAME_TOO_LONG,
	DISPLAY_NAME_TOO_SHORT,
	EMAIL_REQUIRED,
	INVALID_EMAIL,
	PASSWORD_REQUIRED,
	PASSWORD_TOO_LONG,
	PASSWORD_TOO_SHORT,
	NEW_PASSWORD_REQUIRED,
	NEW_PASSWORD_TOO_SHORT,
	NEW_PASSWORD_TOO_LONG,
	CONFIRM_PASSWORD_TOO_LONG,
	CONFIRM_PASSWORD_TOO_SHORT,
	INGREDIENT_NAME_REQUIRED,
	INGREDIENT_COST_PER_UNIT_REQUIRED,
	INGREDIENT_COST_PER_UNIT_POSITIVE,
	INGREDIENT_PURCHASE_UNIT_REQUIRED,
	RECIPE_NAME_REQUIRED,
	RECIPE_METHOD_REQUIRED,
	RECIPE_PREP_TIME_REQUIRED,
	RECIPE_COOK_TIME_REQUIRED,
	RECIPE_SHELF_LIFE_REQUIRED,
	RECIPE_PORTIONS_REQUIRED,
	RECIPE_INGREDIENTS_REQUIRED,
	RECIPE_INGREDIENT_QUANTITY_MUST_BE_POSITIVE_NUMBER,
} from "../content-strings";
import {
	MINIMUM_PASSWORD_LENGTH,
	MAXIMUM_PASSWORD_LENGTH,
	MAXIMUM_DISPLAY_NAME_LENGTH,
	MINIMUM_DISPLAY_NAME_LENGTH,
} from "@recipe-book/shared/lib/constants";
import { PURCHASE_UNITS, TIME_UNITS } from "@recipe-book/shared/lib/units";

export const emailFieldSchema = z
	.string()
	.trim()
	.min(1, EMAIL_REQUIRED)
	.pipe(z.email({ message: INVALID_EMAIL }));

export const passwordFieldSchema = z
	.string()
	.trim()
	.min(1, PASSWORD_REQUIRED)
	.min(MINIMUM_PASSWORD_LENGTH, PASSWORD_TOO_SHORT)
	.max(MAXIMUM_PASSWORD_LENGTH, PASSWORD_TOO_LONG);

export const newPasswordFieldSchema = z
	.string()
	.trim()
	.min(1, NEW_PASSWORD_REQUIRED)
	.min(MINIMUM_PASSWORD_LENGTH, NEW_PASSWORD_TOO_SHORT)
	.max(MAXIMUM_PASSWORD_LENGTH, NEW_PASSWORD_TOO_LONG);

export const confirmPasswordFieldSchema = z
	.string()
	.trim()
	.min(1, CONFIRM_PASSWORD_REQUIRED)
	.min(MINIMUM_PASSWORD_LENGTH, CONFIRM_PASSWORD_TOO_SHORT)
	.max(MAXIMUM_PASSWORD_LENGTH, CONFIRM_PASSWORD_TOO_LONG);

export const displayNameFieldSchema = z
	.string()
	.trim()
	.min(1, DISPLAY_NAME_REQUIRED)
	.min(MINIMUM_DISPLAY_NAME_LENGTH, DISPLAY_NAME_TOO_SHORT)
	.max(MAXIMUM_DISPLAY_NAME_LENGTH, DISPLAY_NAME_TOO_LONG);

export const ingredientNameSchema = z.string().min(1, INGREDIENT_NAME_REQUIRED);

export const ingredientCostPerUnitSchema = z.preprocess(
	(value) => {
		if (value === "") return undefined;
		return Number(value);
	},
	z
		.number({
			error: INGREDIENT_COST_PER_UNIT_REQUIRED,
		})
		.min(0, INGREDIENT_COST_PER_UNIT_POSITIVE),
);

export const ingredientPurchaseUnitSchema = z.string().min(1, INGREDIENT_PURCHASE_UNIT_REQUIRED);

export const recipeNameSchema = z.string().min(1, RECIPE_NAME_REQUIRED);
export const recipeMethodSchema = z.string().min(1, RECIPE_METHOD_REQUIRED);

export const recipeFormIngredientSchema = z.object({
	name: ingredientNameSchema,
	quantity: z
		.number(RECIPE_INGREDIENT_QUANTITY_MUST_BE_POSITIVE_NUMBER)
		.min(1, RECIPE_INGREDIENT_QUANTITY_MUST_BE_POSITIVE_NUMBER),
	unit: z.enum(PURCHASE_UNITS),
});

export const recipeFormIngredientsSchema = recipeFormIngredientSchema
	.array()
	.min(1, RECIPE_INGREDIENTS_REQUIRED);

export const recipePrepTimeSchema = z.object({
	time: z.number().min(1, RECIPE_PREP_TIME_REQUIRED),
	unit: z.enum(TIME_UNITS),
});
export const recipeCookTimeSchema = z.object({
	time: z.number().min(1, RECIPE_COOK_TIME_REQUIRED),
	unit: z.enum(TIME_UNITS),
});
export const recipeShelfLifeSchema = z.object({
	time: z.number().min(1, RECIPE_SHELF_LIFE_REQUIRED),
	unit: z.enum(TIME_UNITS),
});
export const recipeNumberOfPortionsSchema = z.number().int().min(1, RECIPE_PORTIONS_REQUIRED);
