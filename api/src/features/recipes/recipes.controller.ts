import { type Request, type Response } from "express";
import prisma from "../../database/prisma.js";
import type { CreateRecipePayload, UpdateRecipePayload } from "./recipes.validators.js";
import { createRecipeSchema, updateRecipeSchema } from "./recipes.validators.js";

export const getRecipes = async (request: Request, response: Response) => {
	const userId = request.session?.user.id;

	if (!userId) {
		return response.status(401).json({ ok: false, message: "Unauthorized" });
	}

	const recipes = await prisma.recipe.findMany({
		where: { userId },
		orderBy: { name: "asc" },
		include: {
			ingredients: {
				include: {
					ingredient: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			},
			method: {
				orderBy: { stepNumber: "asc" },
			},
		},
	});

	return response.status(200).json({
		ok: true,
		recipes,
	});
};

export type CreateRecipeRequest = Request<object, object, CreateRecipePayload>;

export const createRecipe = async (request: CreateRecipeRequest, response: Response) => {
	const userId = request.session?.user.id;

	if (!userId) {
		return response.status(401).json({ ok: false, message: "Unauthorized" });
	}

	const parsedResult = createRecipeSchema.safeParse(request.body);

	if (!parsedResult.success) {
		const errors = parsedResult.error.issues
			.map((err) => `${err.path.join(".")}: ${err.message}`)
			.join("; ");
		return response.status(400).json({ ok: false, message: errors });
	}

	const { name, ingredients, method, prepTime, cookTime, shelfLife, numberOfPortions } =
		parsedResult.data;

	const createdRecipe = await prisma.$transaction(async (tx) => {
		const recipe = await tx.recipe.create({
			data: {
				userId,
				name,
				prepTime: prepTime.time,
				prepTimeUnit: prepTime.unit,
				cookTime: cookTime.time,
				cookTimeUnit: cookTime.unit,
				shelfLifeDays: Math.floor(shelfLife.time), // Convert to days
				portions: numberOfPortions,
			},
		});

		// Create recipe ingredients
		const recipeIngredientsData = ingredients.map((ingredient) => ({
			userId,
			recipeId: recipe.id,
			ingredientId: ingredient.ingredientId,
			quantity: ingredient.quantity,
			unit: ingredient.unit,
		}));

		await tx.recipeIngredient.createMany({
			data: recipeIngredientsData,
		});

		// Create recipe steps
		const recipeStepsData = method.map((step) => ({
			userId,
			recipeId: recipe.id,
			stepNumber: step.stepNumber,
			text: step.text,
		}));

		await tx.recipeStep.createMany({
			data: recipeStepsData,
		});

		// Fetch the created recipe with all relations
		const fullRecipe = await tx.recipe.findUnique({
			where: {
				id: recipe.id,
			},
			include: {
				ingredients: {
					include: {
						ingredient: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				},
				method: {
					orderBy: { stepNumber: "asc" },
				},
			},
		});

		if (!fullRecipe) {
			throw new Error("Failed to create recipe");
		}

		return fullRecipe;
	});

	return response.status(201).json({ ok: true, recipe: createdRecipe });
};

export type UpdateRecipeRequest = Request<{ id: string }, object, UpdateRecipePayload>;

export const updateRecipe = async (request: UpdateRecipeRequest, response: Response) => {
	const userId = request.session?.user.id;

	if (!userId) {
		return response.status(401).json({ ok: false, message: "Unauthorized" });
	}

	const recipeId = request.params.id?.trim();

	if (!recipeId) {
		return response.status(400).json({
			ok: false,
			message: "Invalid recipe data",
		});
	}

	const parsedResult = updateRecipeSchema.safeParse(request.body ?? {});

	if (!parsedResult.success) {
		const errors = parsedResult.error.issues
			.map((err) => `${err.path.join(".")}: ${err.message}`)
			.join("; ");
		return response.status(400).json({ ok: false, message: errors });
	}

	const recipeData = parsedResult.data;

	const existingRecipe = await prisma.recipe.findFirst({
		where: {
			id: recipeId,
			userId,
		},
	});

	if (!existingRecipe) {
		return response.status(404).json({
			ok: false,
			message: "Recipe not found",
		});
	}

	const updatedRecipe = await prisma.$transaction(async (tx) => {
		const updateData: Record<string, unknown> = {};

		if (recipeData.name !== undefined) {
			updateData.name = recipeData.name;
		}
		if (recipeData.prepTime !== undefined) {
			updateData.prepTime = recipeData.prepTime.time;
			updateData.prepTimeUnit = recipeData.prepTime.unit;
		}
		if (recipeData.cookTime !== undefined) {
			updateData.cookTime = recipeData.cookTime.time;
			updateData.cookTimeUnit = recipeData.cookTime.unit;
		}
		if (recipeData.shelfLife !== undefined) {
			updateData.shelfLifeDays = Math.floor(recipeData.shelfLife.time);
		}
		if (recipeData.numberOfPortions !== undefined) {
			updateData.portions = recipeData.numberOfPortions;
		}

		await tx.recipe.update({
			where: { id: recipeId },
			data: updateData,
		});

		// Update ingredients if provided
		if (recipeData.ingredients !== undefined) {
			// Delete existing ingredients
			await tx.recipeIngredient.deleteMany({
				where: { recipeId },
			});

			// Create new ingredients
			const recipeIngredientsData = recipeData.ingredients.map((ingredient) => ({
				userId,
				recipeId,
				ingredientId: ingredient.ingredientId,
				quantity: ingredient.quantity,
				unit: ingredient.unit,
			}));

			await tx.recipeIngredient.createMany({
				data: recipeIngredientsData,
			});
		}

		// Update recipe steps if provided
		if (recipeData.method !== undefined) {
			// Delete existing steps
			await tx.recipeStep.deleteMany({
				where: { recipeId },
			});

			// Create new steps
			const recipeStepsData = recipeData.method.map((step) => ({
				userId,
				recipeId,
				stepNumber: step.stepNumber,
				text: step.text,
			}));

			await tx.recipeStep.createMany({
				data: recipeStepsData,
			});
		}

		// Fetch the updated recipe with all relations
		return await tx.recipe.findUnique({
			where: { id: recipeId },
			include: {
				ingredients: {
					include: {
						ingredient: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				},
				method: {
					orderBy: { stepNumber: "asc" },
				},
			},
		});
	});

	if (!updatedRecipe) {
		return response.status(500).json({ ok: false, message: "Failed to update recipe" });
	}

	return response.status(200).json({ ok: true, recipe: updatedRecipe });
};

export type DeleteRecipeRequest = Request<{ id: string }, object, { id: string }>;

export const deleteRecipe = async (request: DeleteRecipeRequest, response: Response) => {
	const userId = request.session?.user.id;

	if (!userId) {
		return response.status(401).json({ ok: false, message: "Unauthorized" });
	}

	const recipeId = request.params.id?.trim();

	if (!recipeId) {
		return response.status(400).json({
			ok: false,
			message: "Invalid recipe data",
		});
	}

	const recipe = await prisma.recipe.delete({
		where: {
			userId_id: {
				userId,
				id: recipeId,
			},
		},
	});

	return response.status(200).json({ ok: true, recipe });
};
