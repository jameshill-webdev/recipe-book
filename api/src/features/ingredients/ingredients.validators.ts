import { z } from "zod";
import { PURCHASE_UNITS } from "@recipe-book/shared/lib/units";

export const createIngredientItemSchema = z.object({
	name: z.string().trim().min(1, "Name is required"),
	purchaseUnit: z.enum(PURCHASE_UNITS),
	costPerUnit: z.number().positive("Cost per unit must be positive"),
});

export const createIngredientsPayloadSchema = z.object({
	ingredients: z.array(createIngredientItemSchema).min(1, "At least one ingredient is required"),
});

export const updateIngredientSchema = z.object({
	name: z.string().trim().min(1, "Name is required").optional(),
	purchaseUnit: z.enum(PURCHASE_UNITS).optional(),
	costPerUnit: z.number().positive("Cost per unit must be positive").optional(),
});
