import { Resend } from "resend";
import { createError } from "../errors/error.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
	to,
	subject,
	html,
}: {
	to: string;
	subject: string;
	html: string;
}) {
	const isProd = process.env.NODE_ENV === "production";
	const from = process.env.RESEND_FROM;

	if (!from) {
		throw createError("Email sender is not configured", 500, {
			code: "EMAIL_ERROR",
			details: isProd ? undefined : { missingEnvVar: "RESEND_FROM" },
		});
	}

	const { error } = await resend.emails.send({
		from,
		to,
		subject,
		html,
	});

	if (error) {
		throw createError("Error while attempting to send email", 500, {
			code: "EMAIL_ERROR",
			details: isProd ? undefined : { ...error },
		});
	}
}
