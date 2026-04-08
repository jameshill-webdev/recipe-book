import { type Request, type Response } from "express";
import prisma from "../../database/prisma.js";
import {
	PurchaseUnit,
	type PurchaseUnit as PurchaseUnitValue,
} from "../../generated/prisma/enums.js";

type CreateIngredientRequestBody = {
	name?: string;
	purchaseUnit?: string;
	costPerUnit?: number | string;
};

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
	request: Request<object, object, CreateIngredientRequestBody>,
	response: Response,
) => {
	const userId = request.session?.user.id;

	if (!userId) {
		return response.status(401).json({ ok: false, message: "Unauthorized" });
	}

	const name = request.body.name?.trim();
	const purchaseUnit = request.body.purchaseUnit?.trim().toUpperCase();
	const costPerUnit = Number(request.body.costPerUnit);
	const allowedPurchaseUnits = Object.values(PurchaseUnit);

	if (
		!name ||
		!purchaseUnit ||
		!allowedPurchaseUnits.includes(purchaseUnit as PurchaseUnitValue) ||
		!Number.isFinite(costPerUnit) ||
		costPerUnit < 0
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
			name,
			purchaseUnit: purchaseUnit as PurchaseUnitValue,
			costPerUnit,
		},
	});

	return response.status(201).json({ ok: true, ingredient });
};
