import { useState } from "react";
import { z } from "zod";
import { authClient } from "@/lib/auth";
import { Button } from "@/components/ui/button/button";
import { Field, FieldLabel } from "@/components/ui/field/field";
import { Input } from "@/components/ui/input/input";
import {
	FIELD_LABEL_CONFIRM_PASSWORD,
	FIELD_LABEL_NEW_PASSWORD,
	NETWORK_ERROR,
	PASSWORDS_DO_NOT_MATCH,
	RESET_PASSWORD_BUTTON_TEXT,
	RESET_PASSWORD_PAGE_HEADING,
	RESET_PASSWORD_FORM_LABEL,
	TOKEN_ERROR,
} from "@/lib/content-strings";
import { newPasswordFieldSchema, confirmPasswordFieldSchema } from "@/lib/validation/fields";
import { mapIssuesToFieldErrors } from "@/lib/validation/errors";
import { useNavigate } from "react-router-dom";
import { InlineError } from "@/components/ui/error/error";

const resetPasswordSchema = z
	.object({
		password: newPasswordFieldSchema,
		confirmPassword: confirmPasswordFieldSchema,
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: PASSWORDS_DO_NOT_MATCH,
		path: ["confirmPassword"],
	});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
type ResetPasswordField = keyof ResetPasswordFormValues;
type ResetPasswordFieldErrors = Partial<Record<ResetPasswordField, string>>;

export default function ResetPassword() {
	const navigate = useNavigate();
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [formError, setFormError] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<ResetPasswordFieldErrors>({});

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFormError(null);
		setFieldErrors({});

		const token = new URLSearchParams(window.location.search).get("token");

		if (!token) {
			setFormError(TOKEN_ERROR);
			return;
		}

		const parsedResetPasswordData = resetPasswordSchema.safeParse({
			password,
			confirmPassword,
		});

		if (!parsedResetPasswordData.success) {
			setFieldErrors(
				mapIssuesToFieldErrors<ResetPasswordField>(parsedResetPasswordData.error.issues),
			);
			return;
		}

		try {
			const { error: resetPasswordError } = await authClient.resetPassword({
				newPassword: password,
				token,
			});

			if (resetPasswordError) {
				return setFormError(resetPasswordError.message ?? NETWORK_ERROR);
			}

			navigate("/login", { state: { passwordChanged: true } });
		} catch {
			setFormError(NETWORK_ERROR);
		}
	}

	return (
		<>
			<h1>{RESET_PASSWORD_PAGE_HEADING}</h1>
			<form
				onSubmit={onSubmit}
				className="mx-auto w-full max-w-lg flex flex-col gap-6"
				aria-label={RESET_PASSWORD_FORM_LABEL}
			>
				{formError && <InlineError alert>{formError}</InlineError>}
				<Field>
					<FieldLabel htmlFor="password">{FIELD_LABEL_NEW_PASSWORD}</FieldLabel>
					<Input
						id="password"
						type="password"
						autoComplete="new-password"
						value={password}
						onChange={(e) => {
							setPassword(e.target.value);
							setFieldErrors((currentErrors) => ({
								...currentErrors,
								password: undefined,
							}));
						}}
						placeholder={FIELD_LABEL_NEW_PASSWORD}
						required
					/>
					{fieldErrors.password && (
						<InlineError alert>{fieldErrors.password}</InlineError>
					)}
				</Field>
				<Field>
					<FieldLabel htmlFor="confirm-password">
						{FIELD_LABEL_CONFIRM_PASSWORD}
					</FieldLabel>
					<Input
						id="confirm-password"
						type="password"
						autoComplete="new-password"
						value={confirmPassword}
						onChange={(e) => {
							setConfirmPassword(e.target.value);
							setFieldErrors((currentErrors) => ({
								...currentErrors,
								confirmPassword: undefined,
							}));
						}}
						placeholder={FIELD_LABEL_CONFIRM_PASSWORD}
						required
					/>
					{fieldErrors.confirmPassword && (
						<InlineError alert>{fieldErrors.confirmPassword}</InlineError>
					)}
				</Field>
				<Button type="submit" className="mt-4">
					{RESET_PASSWORD_BUTTON_TEXT}
				</Button>
			</form>
		</>
	);
}
