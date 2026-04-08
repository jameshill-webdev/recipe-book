import { Router } from "express";
import { getIngredients, createIngredient, updateIngredient } from "./ingredients.controller.js";

const router = Router();

router.route("/").get(getIngredients).post(createIngredient);
router.route("/:id").patch(updateIngredient);

export default router;
