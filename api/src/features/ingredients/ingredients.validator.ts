import {
	PurchaseUnit as PurchaseUnitValues,
	type PurchaseUnit,
} from "../../generated/prisma/enums.js";
import type {
	IngredientData,
	CreateIngredientPayload,
	UpdateIngredientPayload,
} from "@recipe-book/shared/types/ingredient";

const allowedPurchaseUnits = Object.values(PurchaseUnitValues);

export function getValidatedCreateIngredientData(body: CreateIngredientPayload) {
	const data: Partial<IngredientData> = {};

	if (body.name !== undefined) {
		const name = body.name?.trim();

		if (!name) {
			return null;
		}

		data.name = name;
	}

	if (body.purchaseUnit !== undefined) {
		const purchaseUnit = body.purchaseUnit?.trim().toUpperCase();

		if (!purchaseUnit || !allowedPurchaseUnits.includes(purchaseUnit as PurchaseUnit)) {
			return null;
		}

		data.purchaseUnit = purchaseUnit as PurchaseUnit;
	}

	if (body.costPerUnit !== undefined) {
		const costPerUnit = Number(body.costPerUnit);

		if (!Number.isFinite(costPerUnit) || costPerUnit < 0) {
			return null;
		}

		data.costPerUnit = costPerUnit.toString();
	}

	if (Object.keys(data).length === 0) {
		return null;
	}

	return data;
}

export function getValidatedUpdateIngredientData(body: UpdateIngredientPayload) {
	const data: Partial<IngredientData> = {};

	if (body.name !== undefined) {
		const name = body.name?.trim();

		data.name = name;
	}

	if (body.purchaseUnit !== undefined) {
		const purchaseUnit = body.purchaseUnit?.trim().toUpperCase();

		if (purchaseUnit && !allowedPurchaseUnits.includes(purchaseUnit as PurchaseUnit)) {
			return null;
		}

		data.purchaseUnit = purchaseUnit as PurchaseUnit;
	}

	if (body.costPerUnit !== undefined) {
		const costPerUnit = Number(body.costPerUnit);

		if (costPerUnit !== undefined && (!Number.isFinite(costPerUnit) || costPerUnit < 0)) {
			return null;
		}

		data.costPerUnit = costPerUnit.toString();
	}

	return data;
}
