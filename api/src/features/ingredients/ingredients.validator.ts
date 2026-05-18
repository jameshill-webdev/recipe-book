import {
	PurchaseUnit as PurchaseUnitValues,
	type PurchaseUnit,
} from "../../generated/prisma/enums.js";
import type {
	IngredientData,
	UpdateIngredientPayload,
	CreateIngredientsPayloadItem,
} from "@recipe-book/shared/types/ingredient";

const allowedPurchaseUnits = Object.values(PurchaseUnitValues);

export function getValidatedCreateIngredientData(data: CreateIngredientsPayloadItem) {
	const validated: Partial<IngredientData> = {};

	if (data.name !== undefined) {
		const name = data.name?.trim();

		if (!name) {
			return null;
		}

		validated.name = name;
	}

	if (data.purchaseUnit !== undefined) {
		const purchaseUnit = data.purchaseUnit?.trim().toUpperCase();

		if (!purchaseUnit || !allowedPurchaseUnits.includes(purchaseUnit as PurchaseUnit)) {
			return null;
		}

		validated.purchaseUnit = purchaseUnit as PurchaseUnit;
	}

	if (data.costPerUnit !== undefined) {
		const costPerUnit = Number(data.costPerUnit);

		if (!Number.isFinite(costPerUnit) || costPerUnit < 0) {
			return null;
		}

		validated.costPerUnit = costPerUnit.toString();
	}

	if (Object.keys(validated).length === 0) {
		return null;
	}

	return validated;
}

export function getValidatedUpdateIngredientData(data: UpdateIngredientPayload) {
	const validated: Partial<IngredientData> = {};

	if (data.name !== undefined) {
		const name = data.name?.trim();

		validated.name = name;
	}

	if (data.purchaseUnit !== undefined) {
		const purchaseUnit = data.purchaseUnit?.trim().toUpperCase();

		if (purchaseUnit && !allowedPurchaseUnits.includes(purchaseUnit as PurchaseUnit)) {
			return null;
		}

		validated.purchaseUnit = purchaseUnit as PurchaseUnit;
	}

	if (data.costPerUnit !== undefined) {
		const costPerUnit = Number(data.costPerUnit);

		if (costPerUnit !== undefined && (!Number.isFinite(costPerUnit) || costPerUnit < 0)) {
			return null;
		}

		validated.costPerUnit = costPerUnit.toString();
	}

	return validated;
}
