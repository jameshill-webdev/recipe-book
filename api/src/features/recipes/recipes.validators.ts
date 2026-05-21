import { z } from "zod";
import { MEASURE_UNITS, TIME_UNITS } from "@recipe-book/shared/lib/units";

const durationSchema = z.object({
	time: z.number().positive("Time must be positive"),
	unit: z.enum(TIME_UNITS),
});

const recipeIngredientSchema = z.object({
	name: z.string().trim().min(1, "Ingredient name is required"),
	ingredientId: z.uuid("Invalid ingredient ID").or(z.literal("")),
	quantity: z.number().positive("Quantity must be positive"),
	unit: z.enum(MEASURE_UNITS),
});

const recipeStepSchema = z.object({
	stepNumber: z.number().int().positive("Step number must be positive"),
	text: z.string().trim().min(1, "Step text is required"),
});

export const createRecipeSchema = z.object({
	name: z.string().trim().min(1, "Recipe name is required"),
	ingredients: z.array(recipeIngredientSchema).min(1, "At least one ingredient is required"),
	method: z.array(recipeStepSchema).min(1, "Method is required"),
	prepTime: durationSchema,
	cookTime: durationSchema,
	shelfLife: durationSchema,
	numberOfPortions: z.number().int().positive("Number of portions must be positive"),
});

export const updateRecipeSchema = z.object({
	name: z.string().trim().min(1, "Recipe name is required").optional(),
	ingredients: z.array(recipeIngredientSchema).optional(),
	method: z.array(recipeStepSchema).optional(),
	prepTime: durationSchema.optional(),
	cookTime: durationSchema.optional(),
	shelfLife: durationSchema.optional(),
	numberOfPortions: z.number().int().positive("Number of portions must be positive").optional(),
});

export type CreateRecipePayload = z.infer<typeof createRecipeSchema>;
export type UpdateRecipePayload = z.infer<typeof updateRecipeSchema>;
