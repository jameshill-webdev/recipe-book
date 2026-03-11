import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import prisma from "@/database/prisma.js";
import { sendEmail } from "./email.js";
import {
	MINIMUM_PASSWORD_LENGTH,
	MAXIMUM_PASSWORD_LENGTH,
} from "@recipe-book/shared/lib/constants";

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
		minPasswordLength: MINIMUM_PASSWORD_LENGTH,
		maxPasswordLength: MAXIMUM_PASSWORD_LENGTH,
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
		onPasswordReset: async ({ user }, request) => {
			console.log(`Password was reset for user ${user.email}`);
			// TODO: send notification email about password reset
		},
	},
	emailVerification: {
		sendOnSignUp: false,
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
