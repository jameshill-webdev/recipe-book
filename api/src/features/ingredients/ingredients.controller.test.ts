import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/database/prisma.js", () => ({
	default: {
		ingredient: {
			findMany: vi.fn(),
			create: vi.fn(),
		},
	},
}));

import prisma from "@/database/prisma.js";
import { createIngredient, getIngredients } from "./ingredients.controller.js";
import { makeRequest, makeResponse } from "@/test/mocks.js";

const testData = {
	user: {
		id: "user-123",
	},
	ingredient: {
		name: "Flour",
		purchaseUnit: "KILOGRAM",
		costPerUnit: 1.99,
	},
};

beforeEach(() => {
	vi.clearAllMocks();
});

describe("getIngredients", () => {
	it("returns the logged in user's ingredients ordered by name", async () => {
		const { res, status, json } = makeResponse();
		const req = makeRequest({
			session: {
				user: {
					id: testData.user.id,
				},
			} as never,
		});
		const ingredients = [
			{
				id: "ingredient-1",
				userId: testData.user.id,
				name: "Flour",
				purchaseUnit: "KILOGRAM",
				costPerUnit: "1.99",
			},
		];

		vi.mocked(prisma.ingredient.findMany).mockResolvedValue(ingredients as never);

		await getIngredients(req, res);

		expect(prisma.ingredient.findMany).toHaveBeenCalledWith({
			where: { userId: testData.user.id },
			orderBy: { name: "asc" },
		});
		expect(status).toHaveBeenCalledWith(200);
		expect(json).toHaveBeenCalledWith({ ok: true, ingredients });
	});

	it("returns 401 when there is no logged in user on the request", async () => {
		const { res, status, json } = makeResponse();
		const req = makeRequest();

		await getIngredients(req, res);

		expect(prisma.ingredient.findMany).not.toHaveBeenCalled();
		expect(status).toHaveBeenCalledWith(401);
		expect(json).toHaveBeenCalledWith({ ok: false, message: "Unauthorized" });
	});
});

describe("createIngredient", () => {
	it("creates a new ingredient for the logged in user and returns 201", async () => {
		const { res, status, json } = makeResponse();
		const req = makeRequest({
			session: {
				user: {
					id: testData.user.id,
				},
			} as never,
			body: testData.ingredient,
		});
		const createdIngredient = {
			id: "ingredient-123",
			userId: testData.user.id,
			name: testData.ingredient.name,
			purchaseUnit: testData.ingredient.purchaseUnit,
			costPerUnit: testData.ingredient.costPerUnit.toString(),
		};

		vi.mocked(prisma.ingredient.create).mockResolvedValue(createdIngredient as never);

		await createIngredient(req, res);

		expect(prisma.ingredient.create).toHaveBeenCalledWith({
			data: {
				userId: testData.user.id,
				name: testData.ingredient.name,
				purchaseUnit: testData.ingredient.purchaseUnit,
				costPerUnit: testData.ingredient.costPerUnit,
			},
		});
		expect(status).toHaveBeenCalledWith(201);
		expect(json).toHaveBeenCalledWith({ ok: true, ingredient: createdIngredient });
	});

	it("returns 401 when there is no logged in user on the request", async () => {
		const { res, status, json } = makeResponse();
		const req = makeRequest({
			body: testData.ingredient,
		});

		await createIngredient(req, res);

		expect(prisma.ingredient.create).not.toHaveBeenCalled();
		expect(status).toHaveBeenCalledWith(401);
		expect(json).toHaveBeenCalledWith({ ok: false, message: "Unauthorized" });
	});
});
