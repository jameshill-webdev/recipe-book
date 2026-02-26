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
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		sendResetPassword: async ({ user, url }) => {
			// Better Auth recommends not awaiting email sends (avoid timing attacks)
			void sendEmail({
				to: user.email,
				subject: "Recipe book app: reset password",
				html: `<p><a href="${url}">Click here</a> to reset your password</p>`,
			});
		},
	},
	emailVerification: {
		sendVerificationEmail: async ({ user, url }) => {
			void sendEmail({
				to: user.email,
				subject: "Recipe book app: verify email address",
				html: `<p><a href="${url}">Click here</a> to verify your email</p>`,
			});
		},
	},
});
