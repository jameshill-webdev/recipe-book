import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import prisma from "@/database/prisma.js";
import { sendEmail } from "./email.js";

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	baseURL: process.env.BETTER_AUTH_URL!,
	secret: process.env.BETTER_AUTH_SECRET!,
	trustedOrigins: [process.env.UI_ORIGIN!],
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		minPasswordLength: 4, // TODO: change for production (only set this low to enable easier development testing)
		sendResetPassword: async ({ user, url }) => {
			// Better Auth recommends not awaiting email sends (avoid timing attacks)
			void sendEmail({
				to: user.email,
				subject: "Recipe book app: reset your password",
				html: `<p><a href="${url}">Click here</a> to reset your password</p>`,
			}).catch((err) => {
				console.error("Failed to send reset password email:", err);
			});
		},
	},
	emailVerification: {
		sendVerificationEmail: async ({ user, url }) => {
			void sendEmail({
				to: user.email,
				subject: "Recipe book app: verify your email address",
				html: `<p><a href="${url}">Click here</a> to verify your email</p>`,
			}).catch((err) => {
				console.error("Failed to send verification email:", err);
			});
		},
	},
	advanced: {
		database: {
			generateId: "uuid",
		},
	},
});
