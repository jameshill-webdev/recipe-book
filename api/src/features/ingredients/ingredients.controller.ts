import { type Request, type Response } from "express";
import prisma from "../../database/prisma.js";
import type {
	CreateIngredientsPayload,
	UpdateIngredientPayload,
} from "@recipe-book/shared/types/ingredient";
import type { PurchaseUnit } from "@/generated/prisma/browser.js";
import {
	createIngredientsPayloadSchema,
	updateIngredientSchema,
} from "./ingredients.validators.js";

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

	const parsedResult = createIngredientsPayloadSchema.safeParse(request.body);

	if (!parsedResult.success || parsedResult.data.ingredients.length === 0) {
		const errors = parsedResult.error?.issues
			.map((err) => `${err.path.join(".")}: ${err.message}`)
			.join("; ");
		return response.status(400).json({ ok: false, message: errors });
	}

	const { ingredients: validatedItems } = parsedResult.data;

	const createdIngredients = await prisma.$transaction(
		validatedItems.map((item) =>
			prisma.ingredient.create({
				data: {
					userId,
					name: item.name,
					purchaseUnit: item.purchaseUnit,
					costPerUnit: item.costPerUnit.toString(),
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

	const ingredientId = request.params.id?.trim();

	if (!ingredientId) {
		return response.status(400).json({
			ok: false,
			message: "Invalid ingredient data",
		});
	}

	const parsedResult = updateIngredientSchema.safeParse(request.body ?? {});

	if (!parsedResult.success) {
		const errors = parsedResult.error.issues
			.map((err) => `${err.path.join(".")}: ${err.message}`)
			.join("; ");
		return response
			.status(400)
			.json({ ok: false, message: errors || "Invalid ingredient data" });
	}

	const ingredientData = parsedResult.data;

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

	const updateData: {
		name?: string;
		purchaseUnit?: PurchaseUnit;
		costPerUnit?: number;
	} = {};

	if (ingredientData.name !== undefined) {
		updateData.name = ingredientData.name;
	}
	if (ingredientData.purchaseUnit !== undefined) {
		updateData.purchaseUnit = ingredientData.purchaseUnit;
	}
	if (ingredientData.costPerUnit !== undefined) {
		updateData.costPerUnit = ingredientData.costPerUnit;
	}

	const ingredient = await prisma.ingredient.update({
		where: {
			userId_id: {
				userId,
				id: ingredientId,
			},
		},
		data: updateData,
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
