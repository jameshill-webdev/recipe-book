import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "@/utils/auth.js";

type Session = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

declare module "express" {
	interface Request {
		session?: Session;
	}
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req.headers),
	});

	if (!session) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	req.session = session;

	next();
}
