import { Router } from "express";
import usersRouter from "./features/users/users.router.js";

const router = Router();

router.use("/users", usersRouter);

export default router;
