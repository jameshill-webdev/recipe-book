import { type Request, type Response } from "express";
import prisma from "../../database/prisma.js";
import type {
	CreateIngredientPayload,
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

export type CreateIngredientRequest = Request<object, object, CreateIngredientPayload>;

export const createIngredient = async (request: CreateIngredientRequest, response: Response) => {
	const userId = request.session?.user.id;

	if (!userId) {
		return response.status(401).json({ ok: false, message: "Unauthorized" });
	}

	const ingredientData = getValidatedCreateIngredientData(request.body ?? {});

	if (
		!ingredientData?.name ||
		!ingredientData.purchaseUnit ||
		ingredientData.costPerUnit === undefined
	) {
		return response.status(400).json({
			ok: false,
			message: "Invalid ingredient data",
		});
	}

	const ingredient = await prisma.ingredient.create({
		data: {
			userId,
			name: ingredientData.name,
			purchaseUnit: ingredientData.purchaseUnit,
			costPerUnit: ingredientData.costPerUnit,
		},
	});

	return response.status(201).json({ ok: true, ingredient });
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
