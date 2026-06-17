import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
	CreateRecipeRequest,
	DeleteRecipeRequest,
	UpdateRecipeRequest,
} from "./recipes.controller.js";

vi.mock("@/database/prisma.js", () => ({
	default: {
		$transaction: vi.fn(),
		recipe: {
			findMany: vi.fn(),
			findFirst: vi.fn(),
			findUnique: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
		},
		recipeIngredient: {
			createMany: vi.fn(),
			deleteMany: vi.fn(),
		},
	},
}));

import prisma from "@/database/prisma.js";
import {
	createRecipe,
	deleteRecipe,
	getRecipeById,
	getRecipes,
	updateRecipe,
} from "./recipes.controller.js";
import { makeRequest, makeResponse } from "@/test/mocks.js";
import { PURCHASE_UNITS } from "@recipe-book/shared/lib/units";

const testData = {
	user: {
		id: "user-123",
	},
	recipe: {
		id: "4a888465-46e0-4feb-bc55-eaccb755a88d",
		name: "Chocolate Cake",
		method: "Mix ingredients and bake at 180C for 30 minutes",
		prepTime: 15,
		prepTimeUnit: "MINUTES",
		cookTime: 30,
		cookTimeUnit: "MINUTES",
		shelfLife: 7,
		shelfLifeUnit: "DAYS",
		portions: 8,
		ingredients: [
			{
				id: "recipe-ingredient-1",
				ingredientId: "00000000-0000-4000-8000-000000000001",
				name: "Flour",
				quantity: 2,
				unit: "KILOGRAM",
				ingredient: {
					id: "00000000-0000-4000-8000-000000000001",
					name: "Flour",
				},
			},
			{
				id: "recipe-ingredient-2",
				ingredientId: "00000000-0000-4000-8000-000000000002",
				name: "Sugar",
				quantity: 1,
				unit: "KILOGRAM",
				ingredient: {
					id: "00000000-0000-4000-8000-000000000002",
					name: "Sugar",
				},
			},
		],
	},
};

beforeEach(() => {
	vi.clearAllMocks();
});

describe("getRecipes", () => {
	it("returns the logged in user's recipes ordered by name", async () => {
		const { res, status, json } = makeResponse();
		const req = makeRequest({
			session: {
				user: {
					id: testData.user.id,
				},
			} as never,
		});
		const recipes = [
			{
				id: testData.recipe.id,
				userId: testData.user.id,
				name: testData.recipe.name,
				method: testData.recipe.method,
				prepTime: testData.recipe.prepTime,
				prepTimeUnit: testData.recipe.prepTimeUnit,
				cookTime: testData.recipe.cookTime,
				cookTimeUnit: testData.recipe.cookTimeUnit,
				shelfLife: testData.recipe.shelfLife,
				shelfLifeUnit: testData.recipe.shelfLifeUnit,
				portions: testData.recipe.portions,
				ingredients: testData.recipe.ingredients,
			},
		];

		vi.mocked(prisma.recipe.findMany).mockResolvedValue(recipes as never);

		await getRecipes(req, res);

		expect(prisma.recipe.findMany).toHaveBeenCalledWith({
			where: { userId: testData.user.id },
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
			},
		});
		expect(status).toHaveBeenCalledWith(200);
		expect(json).toHaveBeenCalledWith({ ok: true, recipes });
	});

	it("returns 401 when there is no logged in user on the request", async () => {
		const { res, status, json } = makeResponse();
		const req = makeRequest();

		await getRecipes(req, res);

		expect(prisma.recipe.findMany).not.toHaveBeenCalled();
		expect(status).toHaveBeenCalledWith(401);
		expect(json).toHaveBeenCalledWith({ ok: false, message: "Unauthorized" });
	});
});

describe("getRecipeById", () => {
	it("returns the logged in user's recipe with the provided id", async () => {
		const { res, status, json } = makeResponse();
		const req = makeRequest({
			session: {
				user: {
					id: testData.user.id,
				},
			} as never,
			params: {
				id: "4a888465-46e0-4feb-bc55-eaccb755a88d",
			},
		});
		const recipes = [
			{
				id: testData.recipe.id,
				userId: testData.user.id,
				name: testData.recipe.name,
				method: testData.recipe.method,
				prepTime: testData.recipe.prepTime,
				prepTimeUnit: testData.recipe.prepTimeUnit,
				cookTime: testData.recipe.cookTime,
				cookTimeUnit: testData.recipe.cookTimeUnit,
				shelfLife: testData.recipe.shelfLife,
				shelfLifeUnit: testData.recipe.shelfLifeUnit,
				portions: testData.recipe.portions,
				ingredients: testData.recipe.ingredients,
			},
		];

		vi.mocked(prisma.recipe.findUnique).mockResolvedValue(recipes[0] as never);

		await getRecipeById(req, res);

		expect(prisma.recipe.findUnique).toHaveBeenCalledWith({
			where: { userId: testData.user.id, id: "4a888465-46e0-4feb-bc55-eaccb755a88d" },
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
			},
		});
		expect(status).toHaveBeenCalledWith(200);
		expect(json).toHaveBeenCalledWith({ ok: true, recipe: recipes[0] });
	});

	it("returns 401 when there is no logged in user on the request", async () => {
		const { res, status, json } = makeResponse();
		const req = makeRequest();

		await getRecipeById(req, res);

		expect(prisma.recipe.findUnique).not.toHaveBeenCalled();
		expect(status).toHaveBeenCalledWith(401);
		expect(json).toHaveBeenCalledWith({ ok: false, message: "Unauthorized" });
	});

	it("returns 400 when there is no ID route parameter provided", async () => {
		const { res, status, json } = makeResponse();
		const req = makeRequest({
			session: {
				user: {
					id: testData.user.id,
				},
			} as never,
			params: {},
		});

		await getRecipeById(req, res);

		expect(prisma.recipe.findUnique).not.toHaveBeenCalled();
		expect(status).toHaveBeenCalledWith(400);
		expect(json).toHaveBeenCalledWith({ ok: false, message: "ID parameter is required" });
	});

	it("returns 400 when the route parameter is an empty string", async () => {
		const { res, status, json } = makeResponse();
		const req = makeRequest({
			session: {
				user: {
					id: testData.user.id,
				},
			} as never,
			params: {
				id: "",
			},
		});

		await getRecipeById(req, res);

		expect(prisma.recipe.findUnique).not.toHaveBeenCalled();
		expect(status).toHaveBeenCalledWith(400);
		expect(json).toHaveBeenCalledWith({ ok: false, message: "ID parameter is required" });
	});
});

describe("createRecipe", () => {
	it("creates a new recipe for the logged in user and returns 201", async () => {
		const { res, status, json } = makeResponse();
		const req = makeRequest({
			session: {
				user: {
					id: testData.user.id,
				},
			} as never,
			body: {
				name: testData.recipe.name,
				method: testData.recipe.method,
				prepTime: {
					time: testData.recipe.prepTime,
					unit: testData.recipe.prepTimeUnit,
				},
				cookTime: {
					time: testData.recipe.cookTime,
					unit: testData.recipe.cookTimeUnit,
				},
				shelfLife: {
					time: testData.recipe.shelfLife,
					unit: "DAYS",
				},
				numberOfPortions: testData.recipe.portions,
				ingredients: [
					{
						name: "Flour",
						ingredientId: "00000000-0000-4000-8000-000000000001",
						quantity: testData.recipe?.ingredients?.[0]?.quantity,
						unit: testData?.recipe?.ingredients?.[0]?.unit,
					},
				],
			},
		});

		const createdRecipe = {
			id: testData.recipe.id,
			userId: testData.user.id,
			name: testData.recipe.name,
			method: testData.recipe.method,
			prepTime: testData.recipe.prepTime,
			prepTimeUnit: testData.recipe.prepTimeUnit,
			cookTime: testData.recipe.cookTime,
			cookTimeUnit: testData.recipe.cookTimeUnit,
			shelfLife: testData.recipe.shelfLife,
			shelfLifeUnit: testData.recipe.shelfLifeUnit,
			portions: testData.recipe.portions,
			ingredients: testData.recipe.ingredients,
		};

		vi.mocked(prisma.$transaction).mockResolvedValue(createdRecipe as never);

		await createRecipe(req as CreateRecipeRequest, res);

		expect(prisma.$transaction).toHaveBeenCalled();
		expect(status).toHaveBeenCalledWith(201);
		expect(json).toHaveBeenCalledWith({ ok: true, recipe: createdRecipe });
	});

	it("returns 400 when recipe name is empty", async () => {
		const { res, status, json } = makeResponse();
		const req = makeRequest({
			session: {
				user: {
					id: testData.user.id,
				},
			} as never,
			body: {
				name: "  ",
				method: testData.recipe.method,
				prepTime: {
					time: testData.recipe.prepTime,
					unit: testData.recipe.prepTimeUnit,
				},
				cookTime: {
					time: testData.recipe.cookTime,
					unit: testData.recipe.cookTimeUnit,
				},
				shelfLife: {
					time: testData.recipe.shelfLife,
					unit: "DAYS",
				},
				numberOfPortions: 8,
				ingredients: [
					{
						name: "Flour",
						ingredientId: "00000000-0000-4000-8000-000000000001",
						quantity: 2,
						unit: "KILOGRAM",
					},
				],
			},
		});

		await createRecipe(req as CreateRecipeRequest, res);

		expect(prisma.$transaction).not.toHaveBeenCalled();
		expect(status).toHaveBeenCalledWith(400);
		expect(json).toHaveBeenCalledWith({
			ok: false,
			message: "name: Recipe name is required",
		});
	});

	it("returns 400 when ingredients array is empty", async () => {
		const { res, status, json } = makeResponse();
		const req = makeRequest({
			session: {
				user: {
					id: testData.user.id,
				},
			} as never,
			body: {
				name: testData.recipe.name,
				method: testData.recipe.method,
				prepTime: {
					time: testData.recipe.prepTime,
					unit: testData.recipe.prepTimeUnit,
				},
				cookTime: {
					time: testData.recipe.cookTime,
					unit: testData.recipe.cookTimeUnit,
				},
				shelfLife: {
					time: testData.recipe.shelfLife,
					unit: "DAYS",
				},
				numberOfPortions: 8,
				ingredients: [],
			},
		});

		await createRecipe(req as CreateRecipeRequest, res);

		expect(prisma.$transaction).not.toHaveBeenCalled();
		expect(status).toHaveBeenCalledWith(400);
		expect(json).toHaveBeenCalledWith({
			ok: false,
			message: "ingredients: At least one ingredient is required",
		});
	});

	it("returns 400 when method is empty", async () => {
		const { res, status, json } = makeResponse();
		const req = makeRequest({
			session: {
				user: {
					id: testData.user.id,
				},
			} as never,
			body: {
				name: testData.recipe.name,
				method: "  ",
				prepTime: {
					time: testData.recipe.prepTime,
					unit: testData.recipe.prepTimeUnit,
				},
				cookTime: {
					time: testData.recipe.cookTime,
					unit: testData.recipe.cookTimeUnit,
				},
				shelfLife: {
					time: testData.recipe.shelfLife,
					unit: "DAYS",
				},
				numberOfPortions: 8,
				ingredients: [
					{
						name: "Flour",
						ingredientId: "00000000-0000-4000-8000-000000000001",
						quantity: 2,
						unit: "KILOGRAM",
					},
				],
			},
		});

		await createRecipe(req as CreateRecipeRequest, res);

		expect(prisma.$transaction).not.toHaveBeenCalled();
		expect(status).toHaveBeenCalledWith(400);
		expect(json).toHaveBeenCalledWith({
			ok: false,
			message: "method: Method is required",
		});
	});

	it("returns 401 when there is no logged in user on the request", async () => {
		const { res, status, json } = makeResponse();
		const req = makeRequest({
			body: {
				name: testData.recipe.name,
				method: testData.recipe.method,
				prepTime: {
					time: testData.recipe.prepTime,
					unit: testData.recipe.prepTimeUnit,
				},
				cookTime: {
					time: testData.recipe.cookTime,
					unit: testData.recipe.cookTimeUnit,
				},
				shelfLife: {
					time: testData.recipe.shelfLife,
					unit: "DAYS",
				},
				numberOfPortions: 8,
				ingredients: [
					{
						name: "Flour",
						ingredientId: "00000000-0000-4000-8000-000000000001",
						quantity: 2,
						unit: "KILOGRAM",
					},
				],
			},
		});

		await createRecipe(req as CreateRecipeRequest, res);

		expect(prisma.$transaction).not.toHaveBeenCalled();
		expect(status).toHaveBeenCalledWith(401);
		expect(json).toHaveBeenCalledWith({ ok: false, message: "Unauthorized" });
	});
});

describe("updateRecipe", () => {
	it("updates all provided recipe fields for the logged in user and returns 200", async () => {
		const updatedRecipe = {
			id: testData.recipe.id,
			userId: testData.user.id,
			name: "Updated Chocolate Cake",
			method: "updated method",
			prepTime: 28,
			prepTimeUnit: "HOURS",
			cookTime: 12,
			cookTimeUnit: "HOURS",
			shelfLife: testData.recipe.shelfLife,
			shelfLifeUnit: testData.recipe.shelfLifeUnit,
			portions: 6,
			ingredients: [
				...testData.recipe.ingredients,
				{
					name: "Updated ingredient",
					ingredientId: "00000000-0000-4000-8000-000000000002",
					quantity: 7,
					unit: PURCHASE_UNITS[3],
				},
			],
		};
		const { res, status, json } = makeResponse();
		const req = makeRequest({
			session: {
				user: {
					id: testData.user.id,
				},
			} as never,
			params: {
				id: testData.recipe.id,
			},
			body: {
				name: updatedRecipe.name,
				method: updatedRecipe.method,
				prepTime: {
					time: updatedRecipe.prepTime,
					unit: updatedRecipe.prepTimeUnit,
				},
				cookTime: {
					time: updatedRecipe.cookTime,
					unit: updatedRecipe.cookTimeUnit,
				},
				shelfLife: {
					time: updatedRecipe.shelfLife,
					unit: "DAYS",
				},
				numberOfPortions: updatedRecipe.portions,
				ingredients: updatedRecipe.ingredients,
			},
		});

		vi.mocked(prisma.recipe.findFirst).mockResolvedValue(testData.recipe as never);
		vi.mocked(prisma.$transaction).mockResolvedValue(updatedRecipe as never);

		await updateRecipe(req as UpdateRecipeRequest, res);

		expect(prisma.recipe.findFirst).toHaveBeenCalledWith({
			where: {
				id: testData.recipe.id,
				userId: testData.user.id,
			},
		});
		expect(prisma.$transaction).toHaveBeenCalled();
		expect(status).toHaveBeenCalledWith(200);
		expect(json).toHaveBeenCalledWith({ ok: true, recipe: updatedRecipe });
	});

	it("allows updating only the recipe name", async () => {
		const { res, status, json } = makeResponse();
		const req = makeRequest({
			session: {
				user: {
					id: testData.user.id,
				},
			} as never,
			params: {
				id: testData.recipe.id,
			},
			body: {
				name: "Simple Cake",
			},
		});

		const updatedRecipe = {
			id: testData.recipe.id,
			userId: testData.user.id,
			name: "Simple Cake",
			method: testData.recipe.method,
			prepTime: testData.recipe.prepTime,
			prepTimeUnit: testData.recipe.prepTimeUnit,
			cookTime: testData.recipe.cookTime,
			cookTimeUnit: testData.recipe.cookTimeUnit,
			shelfLife: testData.recipe.shelfLife,
			shelfLifeUnit: testData.recipe.shelfLifeUnit,
			portions: testData.recipe.portions,
			ingredients: testData.recipe.ingredients,
		};

		vi.mocked(prisma.recipe.findFirst).mockResolvedValue({} as never);
		vi.mocked(prisma.$transaction).mockResolvedValue(updatedRecipe as never);

		await updateRecipe(req as UpdateRecipeRequest, res);

		expect(prisma.$transaction).toHaveBeenCalled();
		expect(status).toHaveBeenCalledWith(200);
		expect(json).toHaveBeenCalledWith({ ok: true, recipe: updatedRecipe });
	});

	it("returns 400 when recipe id is not provided", async () => {
		const { res, status, json } = makeResponse();
		const req = makeRequest({
			session: {
				user: {
					id: testData.user.id,
				},
			} as never,
			params: {
				id: "   ",
			},
			body: {
				name: "Updated Name",
			},
		});

		await updateRecipe(req as UpdateRecipeRequest, res);

		expect(prisma.recipe.findFirst).not.toHaveBeenCalled();
		expect(status).toHaveBeenCalledWith(400);
		expect(json).toHaveBeenCalledWith({
			ok: false,
			message: "Invalid recipe data",
		});
	});

	it("returns 404 when recipe is not found", async () => {
		const { res, status, json } = makeResponse();
		const req = makeRequest({
			session: {
				user: {
					id: testData.user.id,
				},
			} as never,
			params: {
				id: "nonexistent-id",
			},
			body: {
				name: "Updated Name",
			},
		});

		vi.mocked(prisma.recipe.findFirst).mockResolvedValue(null as never);

		await updateRecipe(req as UpdateRecipeRequest, res);

		expect(prisma.$transaction).not.toHaveBeenCalled();
		expect(status).toHaveBeenCalledWith(404);
		expect(json).toHaveBeenCalledWith({
			ok: false,
			message: "Recipe not found",
		});
	});

	it("returns 401 when there is no logged in user on the request", async () => {
		const { res, status, json } = makeResponse();
		const req = makeRequest({
			params: {
				id: testData.recipe.id,
			},
			body: {
				name: "Updated Name",
			},
		});

		await updateRecipe(req as UpdateRecipeRequest, res);

		expect(prisma.recipe.findFirst).not.toHaveBeenCalled();
		expect(status).toHaveBeenCalledWith(401);
		expect(json).toHaveBeenCalledWith({ ok: false, message: "Unauthorized" });
	});
});

describe("deleteRecipe", () => {
	it("deletes the recipe for the logged in user and returns 200", async () => {
		const { res, status, json } = makeResponse();
		const req = makeRequest({
			session: {
				user: {
					id: testData.user.id,
				},
			} as never,
			params: {
				id: `  ${testData.recipe.id}  `,
			},
		});

		const deletedRecipe = {
			id: testData.recipe.id,
			userId: testData.user.id,
			name: testData.recipe.name,
			method: testData.recipe.method,
			prepTime: testData.recipe.prepTime,
			prepTimeUnit: testData.recipe.prepTimeUnit,
			cookTime: testData.recipe.cookTime,
			cookTimeUnit: testData.recipe.cookTimeUnit,
			shelfLife: testData.recipe.shelfLife,
			shelfLifeUnit: testData.recipe.shelfLifeUnit,
			portions: testData.recipe.portions,
		};

		vi.mocked(prisma.recipe.delete).mockResolvedValue(deletedRecipe as never);

		await deleteRecipe(req as DeleteRecipeRequest, res);

		expect(prisma.recipe.delete).toHaveBeenCalledWith({
			where: {
				userId_id: {
					userId: testData.user.id,
					id: testData.recipe.id,
				},
			},
		});
		expect(status).toHaveBeenCalledWith(200);
		expect(json).toHaveBeenCalledWith({ ok: true, recipe: deletedRecipe });
	});

	it("returns 400 when no recipe id is provided", async () => {
		const { res, status, json } = makeResponse();
		const req = makeRequest({
			session: {
				user: {
					id: testData.user.id,
				},
			} as never,
			params: {
				id: "   ",
			},
		});

		await deleteRecipe(req as DeleteRecipeRequest, res);

		expect(prisma.recipe.delete).not.toHaveBeenCalled();
		expect(status).toHaveBeenCalledWith(400);
		expect(json).toHaveBeenCalledWith({
			ok: false,
			message: "Invalid recipe data",
		});
	});

	it("returns 401 when there is no logged in user on the request", async () => {
		const { res, status, json } = makeResponse();
		const req = makeRequest({
			params: {
				id: testData.recipe.id,
			},
		});

		await deleteRecipe(req as DeleteRecipeRequest, res);

		expect(prisma.recipe.delete).not.toHaveBeenCalled();
		expect(status).toHaveBeenCalledWith(401);
		expect(json).toHaveBeenCalledWith({ ok: false, message: "Unauthorized" });
	});
});
