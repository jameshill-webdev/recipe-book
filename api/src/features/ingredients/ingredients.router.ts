import { Router } from "express";
import {
	getIngredients,
	createIngredients,
	updateIngredient,
	deleteIngredient,
} from "./ingredients.controller.js";

const router = Router();

router.route("/").get(getIngredients).post(createIngredients);
router.route("/:id").patch(updateIngredient).delete(deleteIngredient);

export default router;
