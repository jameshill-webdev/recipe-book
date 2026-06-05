import { Router } from "express";
import usersRouter from "./features/users/users.router.js";
import { sendEmail } from "./utils/email.js";
import { requireAuth } from "./middleware/requireAuth.js";
import ingredientsRouter from "./features/ingredients/ingredients.router.js";
import recipesRouter from "./features/recipes/recipes.router.js";

const router = Router();

router.use("/users", usersRouter);

router.use("/ingredients", requireAuth, ingredientsRouter);
router.use("/recipes", requireAuth, recipesRouter);

// auth test route
router.use("/authtest", requireAuth, async (req, res) => {
	res.json({ ok: true });
});

// email test route
router.use("/sendemail", async (request, response) => {
	const now = Date.now();

	await sendEmail({
		to: process.env.TEST_EMAIL_ADDRESS!,
		subject: `test email ${now}`,
		html: `<h1>Test email</h1><p>This is a test sent at ${now}.</p>`,
	});

	return response.status(200).json({ ok: true, message: `email sent at ${now}` });
});

export default router;
