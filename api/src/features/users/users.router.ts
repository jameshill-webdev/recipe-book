import { Router } from "express";
import { getAllUsers } from "./users.controller.js";

const router = Router();

router.route('/').get(getAllUsers);

export default router;