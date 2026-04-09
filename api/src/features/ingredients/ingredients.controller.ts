import { type Request, type Response } from "express";
import prisma from "../../database/prisma.js";
import {
	PurchaseUnit,
	type PurchaseUnit as PurchaseUnitValue,
} from "../../generated/prisma/enums.js";

type IngredientRequestBody = {
	name?: string;
	purchaseUnit?: string;
	costPerUnit?: number | string;
};

type IngredientParams = {
	id?: string;
};

type IngredientData = {
	name: string;
	purchaseUnit: PurchaseUnitValue;
	costPerUnit: number;
};

const allowedPurchaseUnits = Object.values(PurchaseUnit);

function getValidatedIngredientData(body: IngredientRequestBody) {
	const data: Partial<IngredientData> = {};
	const hasName = Object.prototype.hasOwnProperty.call(body, "name");
	const hasPurchaseUnit = Object.prototype.hasOwnProperty.call(body, "purchaseUnit");
	const hasCostPerUnit = Object.prototype.hasOwnProperty.call(body, "costPerUnit");

	if (hasName) {
		const name = body.name?.trim();

		if (!name) {
			return null;
		}

		data.name = name;
	}

	if (hasPurchaseUnit) {
		const purchaseUnit = body.purchaseUnit?.trim().toUpperCase();

		if (!purchaseUnit || !allowedPurchaseUnits.includes(purchaseUnit as PurchaseUnitValue)) {
			return null;
		}

		data.purchaseUnit = purchaseUnit as PurchaseUnitValue;
	}

	if (hasCostPerUnit) {
		const costPerUnit = Number(body.costPerUnit);

		if (!Number.isFinite(costPerUnit) || costPerUnit < 0) {
			return null;
		}

		data.costPerUnit = costPerUnit;
	}

	if (Object.keys(data).length === 0) {
		return null;
	}

	return data;
}

export const getIngredients = async (request: Request, response: Response) => {
	const userId = request.session?.user.id;

	if (!userId) {
		return response.status(401).json({ ok: false, message: "Unauthorized" });
	}

	const ingredients = await prisma.ingredient.findMany({
		where: { userId },
		orderBy: { name: "asc" },
	});

	return response.status(200).json({ ok: true, ingredients });
};

export const createIngredient = async (
	request: Request<object, object, IngredientRequestBody>,
	response: Response,
) => {
	const userId = request.session?.user.id;

	if (!userId) {
		return response.status(401).json({ ok: false, message: "Unauthorized" });
	}

	const ingredientData = getValidatedIngredientData(request.body ?? {});

	if (
		!ingredientData?.name ||
		!ingredientData.purchaseUnit ||
		ingredientData.costPerUnit === undefined
	) {
		return response.status(400).json({
			ok: false,
			message: "Invalid ingredient data",
			allowedPurchaseUnits,
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

export const updateIngredient = async (
	request: Request<IngredientParams, object, IngredientRequestBody>,
	response: Response,
) => {
	const userId = request.session?.user.id;

	if (!userId) {
		return response.status(401).json({ ok: false, message: "Unauthorized" });
	}

	const ingredientId = request.params.id?.trim();
	const ingredientData = getValidatedIngredientData(request.body ?? {});

	if (!ingredientId || !ingredientData) {
		return response.status(400).json({
			ok: false,
			message: "Invalid ingredient data",
			allowedPurchaseUnits,
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

export const deleteIngredient = async (
	request: Request<IngredientParams, object, IngredientRequestBody>,
	response: Response,
) => {
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
