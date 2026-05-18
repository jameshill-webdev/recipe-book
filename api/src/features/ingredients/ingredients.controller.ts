import { type Request, type Response } from "express";
import prisma from "../../database/prisma.js";
import type {
	CreateIngredientsPayload,
	CreateIngredientsPayloadItem,
	UpdateIngredientPayload,
} from "@recipe-book/shared/types/ingredient";
import {
	getValidatedCreateIngredientData,
	getValidatedUpdateIngredientData,
} from "./ingredients.validator.js";

export const getIngredients = async (request: Request, response: Response) => {
	const userId = request.session?.user.id;

	if (!userId) {
		return response.status(401).json({ ok: false, message: "Unauthorized" });
	}

	const ingredients = await prisma.ingredient.findMany({
		where: { userId },
		orderBy: { name: "asc" },
		select: {
			id: true,
			name: true,
			purchaseUnit: true,
			costPerUnit: true,
		},
	});

	return response.status(200).json({
		ok: true,
		ingredients,
	});
};

export type CreateIngredientRequest = Request<object, object, CreateIngredientsPayload>;

export const createIngredient = async (request: CreateIngredientRequest, response: Response) => {
	const userId = request.session?.user.id;

	if (!userId) {
		return response.status(401).json({ ok: false, message: "Unauthorized" });
	}

	const body = request.body;

	if (!Array.isArray(body.ingredients) || body.ingredients.length === 0) {
		return response.status(400).json({ ok: false, message: "Invalid ingredient data" });
	}

	const validatedItems = [] as CreateIngredientsPayloadItem[];

	for (const item of body.ingredients) {
		const validated = getValidatedCreateIngredientData(item as CreateIngredientsPayloadItem);

		if (!validated?.name || !validated.purchaseUnit || validated.costPerUnit === undefined) {
			return response.status(400).json({ ok: false, message: "Invalid ingredient data" });
		}

		validatedItems.push({
			name: validated.name,
			purchaseUnit: validated.purchaseUnit,
			costPerUnit: validated.costPerUnit,
		});
	}

	if (validatedItems.length === 0) {
		return response.status(400).json({ ok: false, message: "Invalid ingredient data" });
	}

	const createdIngredients = await prisma.$transaction(
		validatedItems.map((item) =>
			prisma.ingredient.create({
				data: {
					userId,
					name: item.name,
					purchaseUnit: item.purchaseUnit,
					costPerUnit: item.costPerUnit,
				},
			}),
		),
	);

	return response.status(201).json({ ok: true, ingredients: createdIngredients });
};

export type UpdateIngredientRequest = Request<{ id: string }, object, UpdateIngredientPayload>;

export const updateIngredient = async (request: UpdateIngredientRequest, response: Response) => {
	const userId = request.session?.user.id;

	if (!userId) {
		return response.status(401).json({ ok: false, message: "Unauthorized" });
	}

	console.log("Update ingredient request body:", request.body);

	const ingredientId = request.params.id?.trim();
	const ingredientData = getValidatedUpdateIngredientData(request.body ?? {});

	if (!ingredientId || ingredientData === null) {
		return response.status(400).json({
			ok: false,
			message: "Invalid ingredient data",
		});
	}

	if (Object.keys(ingredientData).length === 0) {
		console.log("No fields provided for update.");

		const ingredient = await prisma.ingredient.findUnique({
			where: {
				userId_id: {
					userId,
					id: ingredientId,
				},
			},
		});

		return response.status(200).json({
			ok: true,
			message: "No fields provided for update.",
			ingredient,
		});
	}

	const ingredient = await prisma.ingredient.update({
		where: {
			userId_id: {
				userId,
				id: ingredientId,
			},
		},
		data: ingredientData,
	});

	return response.status(200).json({ ok: true, ingredient });
};

export type DeleteIngredientRequest = Request<{ id: string }, object, { id: string }>;

export const deleteIngredient = async (request: DeleteIngredientRequest, response: Response) => {
	// TODO: implement try/catch for all controller functions and return 500 status code with error message if an unexpected error occurs

	const userId = request.session?.user.id;

	if (!userId) {
		return response.status(401).json({ ok: false, message: "Unauthorized" });
	}

	const ingredientId = request.params.id?.trim();

	if (!ingredientId) {
		return response.status(400).json({
			ok: false,
			message: "Invalid ingredient data",
		});
	}

	const ingredient = await prisma.ingredient.delete({
		where: {
			userId_id: {
				userId,
				id: ingredientId,
			},
		},
	});

	return response.status(200).json({ ok: true, ingredient });
};
