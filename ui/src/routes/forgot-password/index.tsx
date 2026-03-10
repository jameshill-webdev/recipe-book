import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { InlineError } from "@/components/ui/error";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	FIELD_LABEL_EMAIL,
	FORGOT_PASSWORD_BUTTON_TEXT,
	FORGOT_PASSWORD_FORM_LABEL,
	FORGOT_PASSWORD_PAGE_HEADING,
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
	const [fieldErrors, setFieldErrors] = useState<ForgotPasswordFieldErrors>({});

	function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFieldErrors({});

		const parsedForgotPasswordData = forgotPasswordSchema.safeParse({
			email,
		});

		if (!parsedForgotPasswordData.success) {
			setFieldErrors(
				mapIssuesToFieldErrors<ForgotPasswordField>(parsedForgotPasswordData.error.issues),
			);
		}

		// TODO: implement forgot password functionality
	}

	return (
		<>
			<h1>{FORGOT_PASSWORD_PAGE_HEADING}</h1>
			<form
				onSubmit={onSubmit}
				className="mx-auto w-full max-w-lg flex flex-col gap-6"
				aria-label={FORGOT_PASSWORD_FORM_LABEL}
			>
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
					{fieldErrors.email && <InlineError alert>{fieldErrors.email}</InlineError>}
				</Field>
				<Button type="submit" className="mt-4">
					{FORGOT_PASSWORD_BUTTON_TEXT}
				</Button>
			</form>
		</>
	);
}
