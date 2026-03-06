import { useState } from "react";
import { z } from "zod";
import { authClient } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InlineError } from "@/components/ui/error";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	DISPLAY_NAME_TOO_SHORT,
	DISPLAY_NAME_TOO_LONG,
	GENERIC_ERROR,
	INVALID_EMAIL,
	NETWORK_ERROR,
	PASSWORD_TOO_SHORT,
	PASSWORD_TOO_LONG,
	LOGIN_LINK_TEXT,
	SIGNUP_BUTTON_TEXT,
	SIGNUP_FORM_LABEL,
} from "@/lib/messages";
import {
	MAXIMUM_DISPLAY_NAME_LENGTH,
	MAXIMUM_PASSWORD_LENGTH,
	MINIMUM_DISPLAY_NAME_LENGTH,
	MINIMUM_PASSWORD_LENGTH,
} from "@/lib/constants";

const signUpSchema = z.object({
	email: z.email(INVALID_EMAIL),
	password: z
		.string()
		.min(MINIMUM_PASSWORD_LENGTH, PASSWORD_TOO_SHORT)
		.max(MAXIMUM_PASSWORD_LENGTH, PASSWORD_TOO_LONG),
	name: z
		.string()
		.trim()
		.min(MINIMUM_DISPLAY_NAME_LENGTH, DISPLAY_NAME_TOO_SHORT)
		.max(MAXIMUM_DISPLAY_NAME_LENGTH, DISPLAY_NAME_TOO_LONG),
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
			const validationErrors: SignUpFieldErrors = {};

			for (const issue of parsedSignUpData.error.issues) {
				const field = issue.path[0];

				if (typeof field === "string" && !(field in validationErrors)) {
					validationErrors[field as SignUpField] = issue.message;
				}
			}

			setFieldErrors(validationErrors);
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
				callbackURL: `${window.location.origin}/email-verified`,
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
			<h1>Sign up</h1>
			<form
				onSubmit={onSubmit}
				className="mx-auto w-full max-w-lg flex flex-col gap-6"
				aria-label={SIGNUP_FORM_LABEL}
			>
				{formError && <InlineError alert>{formError}</InlineError>}
				<Field>
					<FieldLabel htmlFor="email">Email</FieldLabel>
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
						placeholder="Email"
						required
					/>
					{fieldErrors.email && <InlineError alert>{fieldErrors.email}</InlineError>}
				</Field>
				<Field>
					<FieldLabel htmlFor="password">Password</FieldLabel>
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
						placeholder="Password"
						type="password"
						autoComplete="new-password"
						required
					/>
					{fieldErrors.password && (
						<InlineError alert>{fieldErrors.password}</InlineError>
					)}
				</Field>
				<Field>
					<FieldLabel htmlFor="name">Display name</FieldLabel>
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
						placeholder="Display name"
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
