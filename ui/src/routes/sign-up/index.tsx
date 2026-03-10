import { useState } from "react";
import { z } from "zod";
import { authClient } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InlineError } from "@/components/ui/error";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	GENERIC_ERROR,
	NETWORK_ERROR,
	LOGIN_LINK_TEXT,
	SIGNUP_BUTTON_TEXT,
	SIGNUP_FORM_LABEL,
	SIGNUP_PAGE_HEADING,
	FIELD_LABEL_EMAIL,
	FIELD_LABEL_PASSWORD,
	FIELD_LABEL_DISPLAY_NAME,
} from "@/lib/content-strings";
import { mapIssuesToFieldErrors } from "@/lib/validation/errors";
import {
	displayNameFieldSchema,
	emailFieldSchema,
	passwordFieldSchema,
} from "@/lib/validation/fields";

const signUpSchema = z.object({
	email: emailFieldSchema,
	password: passwordFieldSchema,
	name: displayNameFieldSchema,
});

type SignUpFormValues = z.infer<typeof signUpSchema>;
type SignUpField = keyof SignUpFormValues;
type SignUpFieldErrors = Partial<Record<SignUpField, string>>;

export default function SignUp() {
	const navigate = useNavigate();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [formError, setFormError] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<SignUpFieldErrors>({});

	async function onSubmit(event: React.SubmitEvent) {
		event.preventDefault();
		setFormError(null);
		setFieldErrors({});

		const parsedSignUpData = signUpSchema.safeParse({
			name,
			email,
			password,
		});

		if (!parsedSignUpData.success) {
			setFieldErrors(mapIssuesToFieldErrors<SignUpField>(parsedSignUpData.error.issues));
			return;
		}

		const {
			name: validatedName,
			email: validatedEmail,
			password: validatedPassword,
		} = parsedSignUpData.data;

		try {
			const { error: signUpError } = await authClient.signUp.email({
				name: validatedName,
				email: validatedEmail,
				password: validatedPassword,
				callbackURL: `${window.location.origin}/verify-email`,
			});

			if (signUpError) {
				return setFormError(signUpError.message ?? GENERIC_ERROR);
			}

			const { error: verifyError } = await authClient.sendVerificationEmail({
				email: validatedEmail,
				callbackURL: `${window.location.origin}/login`,
			});

			if (verifyError) {
				return setFormError(verifyError.message ?? GENERIC_ERROR);
			}

			navigate("/verify-email?sent=1");
		} catch {
			setFormError(NETWORK_ERROR);
		}
	}

	return (
		<>
			<h1>{SIGNUP_PAGE_HEADING}</h1>
			<form
				onSubmit={onSubmit}
				className="mx-auto w-full max-w-lg flex flex-col gap-6"
				aria-label={SIGNUP_FORM_LABEL}
			>
				{formError && <InlineError alert>{formError}</InlineError>}
				<Field>
					<FieldLabel htmlFor="email">{FIELD_LABEL_EMAIL}</FieldLabel>
					<Input
						id="email"
						value={email}
						onChange={(e) => {
							setEmail(e.target.value);
							setFieldErrors((currentErrors) => ({
								...currentErrors,
								email: undefined,
							}));
						}}
						type="email"
						autoComplete="email"
						placeholder={FIELD_LABEL_EMAIL}
						required
					/>
					{fieldErrors.email && <InlineError alert>{fieldErrors.email}</InlineError>}
				</Field>
				<Field>
					<FieldLabel htmlFor="password">{FIELD_LABEL_PASSWORD}</FieldLabel>
					<Input
						id="password"
						value={password}
						onChange={(e) => {
							setPassword(e.target.value);
							setFieldErrors((currentErrors) => ({
								...currentErrors,
								password: undefined,
							}));
						}}
						placeholder={FIELD_LABEL_PASSWORD}
						type="password"
						autoComplete="new-password"
						required
					/>
					{fieldErrors.password && (
						<InlineError alert>{fieldErrors.password}</InlineError>
					)}
				</Field>
				<Field>
					<FieldLabel htmlFor="name">{FIELD_LABEL_DISPLAY_NAME}</FieldLabel>
					<Input
						id="name"
						value={name}
						onChange={(e) => {
							setName(e.target.value);
							setFieldErrors((currentErrors) => ({
								...currentErrors,
								name: undefined,
							}));
						}}
						placeholder={FIELD_LABEL_DISPLAY_NAME}
						autoComplete="name"
						required
					/>
					{fieldErrors.name && <InlineError alert>{fieldErrors.name}</InlineError>}
				</Field>
				<div className="flex flex-col">
					<Button type="submit" className="mt-4 mb-5">
						{SIGNUP_BUTTON_TEXT}
					</Button>
					<Button asLink to="/login" variant="link" className="w-full">
						{LOGIN_LINK_TEXT}
					</Button>
				</div>
			</form>
		</>
	);
}
