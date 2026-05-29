import { Router } from "express";
import {
	getRecipes,
	createRecipe,
	getRecipeById,
	updateRecipe,
	deleteRecipe,
} from "./recipes.controller.js";

const router = Router();

router.route("/").get(getRecipes).post(createRecipe);
router.route("/:id").get(getRecipeById).patch(updateRecipe).delete(deleteRecipe);

export default router;
