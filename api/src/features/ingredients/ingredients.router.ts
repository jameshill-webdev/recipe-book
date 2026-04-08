import { Router } from "express";
import { getIngredients, createIngredient } from "./ingredients.controller.js";

const router = Router();

router.route("/").get(getIngredients).post(createIngredient);

export default router;
