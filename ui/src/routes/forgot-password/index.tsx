import { useState } from "react";
import { z } from "zod";
import { authClient } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { InlineError } from "@/components/ui/error";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	FIELD_LABEL_EMAIL,
	FORGOT_PASSWORD_BUTTON_TEXT,
	FORGOT_PASSWORD_FORM_LABEL,
	FORGOT_PASSWORD_INSTRUCTIONAL_TEXT,
	FORGOT_PASSWORD_PAGE_HEADING,
	FORGOT_PASSWORD_SUCCESS_TEXT,
	GENERIC_ERROR,
	NETWORK_ERROR,
} from "@/lib/content-strings";
import { mapIssuesToFieldErrors } from "@/lib/validation/errors";
import { emailFieldSchema } from "@/lib/validation/fields";

const forgotPasswordSchema = z.object({
	email: emailFieldSchema,
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
type ForgotPasswordField = keyof ForgotPasswordFormValues;
type ForgotPasswordFieldErrors = Partial<Record<ForgotPasswordField, string>>;

export default function ForgotPassword() {
	const [email, setEmail] = useState("");
	const [resetSubmitted, setResetSubmitted] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<ForgotPasswordFieldErrors>({});

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFormError(null);
		setFieldErrors({});

		const parsedForgotPasswordData = forgotPasswordSchema.safeParse({
			email,
		});

		if (!parsedForgotPasswordData.success) {
			setFieldErrors(
				mapIssuesToFieldErrors<ForgotPasswordField>(parsedForgotPasswordData.error.issues),
			);
			return;
		}

		const { email: validatedEmail } = parsedForgotPasswordData.data;

		try {
			const { error: requestPasswordResetError } = await authClient.requestPasswordReset({
				email: validatedEmail,
				redirectTo: new URL("/reset-password", window.location.origin).toString(),
			});

			if (requestPasswordResetError) {
				return setFormError(requestPasswordResetError.message ?? GENERIC_ERROR);
			}

			setResetSubmitted(true);
		} catch {
			setFormError(NETWORK_ERROR);
		}
	}

	return (
		<>
			<h1>{FORGOT_PASSWORD_PAGE_HEADING}</h1>
			{resetSubmitted ? (
				<p className="text-center mb-10">{FORGOT_PASSWORD_SUCCESS_TEXT}</p>
			) : (
				<>
					<p className="text-center mb-10">{FORGOT_PASSWORD_INSTRUCTIONAL_TEXT}</p>
					<form
						onSubmit={onSubmit}
						className="mx-auto w-full max-w-lg flex flex-col gap-6"
						aria-label={FORGOT_PASSWORD_FORM_LABEL}
					>
						{formError && <InlineError alert>{formError}</InlineError>}
						<Field>
							<FieldLabel htmlFor="email">{FIELD_LABEL_EMAIL}</FieldLabel>
							<Input
								id="email"
								type="email"
								autoComplete="email"
								value={email}
								onChange={(e) => {
									setEmail(e.target.value);
									setFieldErrors((currentErrors) => ({
										...currentErrors,
										email: undefined,
									}));
								}}
								placeholder={FIELD_LABEL_EMAIL}
								required
							/>
							{fieldErrors.email && (
								<InlineError alert>{fieldErrors.email}</InlineError>
							)}
						</Field>
						<Button type="submit" className="mt-4">
							{FORGOT_PASSWORD_BUTTON_TEXT}
						</Button>
					</form>
				</>
			)}
		</>
	);
}
