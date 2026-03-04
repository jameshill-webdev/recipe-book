import { useState } from "react";
import { z } from "zod";
import { authClient } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	displayNameTooLong,
	displayNameTooShort,
	genericError,
	invalidEmail,
	networkError,
	passwordTooLong,
	passwordTooShort,
} from "@/lib/messages";
import {
	MAXIMUM_DISPLAY_NAME_LENGTH,
	MAXIMUM_PASSWORD_LENGTH,
	MINIMUM_DISPLAY_NAME_LENGTH,
	MINIMUM_PASSWORD_LENGTH,
} from "@/lib/constants";

const signUpSchema = z.object({
	email: z.email(invalidEmail),
	password: z
		.string()
		.min(MINIMUM_PASSWORD_LENGTH, passwordTooShort)
		.max(MAXIMUM_PASSWORD_LENGTH, passwordTooLong),
	name: z
		.string()
		.trim()
		.min(MINIMUM_DISPLAY_NAME_LENGTH, displayNameTooShort)
		.max(MAXIMUM_DISPLAY_NAME_LENGTH, displayNameTooLong),
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
				return setFormError(signUpError.message ?? genericError);
			}

			const { error: verifyError } = await authClient.sendVerificationEmail({
				email: validatedEmail,
				callbackURL: `${window.location.origin}/email-verified`,
			});

			if (verifyError) {
				return setFormError(verifyError.message ?? genericError);
			}

			navigate("/verify-email?sent=1");
		} catch {
			setFormError(networkError);
		}
	}

	return (
		<>
			<h1>Sign up</h1>
			<form onSubmit={onSubmit} className="mx-auto w-full max-w-lg flex flex-col gap-6">
				{formError && <FieldError>{formError}</FieldError>}
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
					{fieldErrors.email && <FieldError>{fieldErrors.email}</FieldError>}
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
					{fieldErrors.password && <FieldError>{fieldErrors.password}</FieldError>}
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
					{fieldErrors.name && <FieldError>{fieldErrors.name}</FieldError>}
				</Field>
				<Button type="submit" className="mt-4">
					Create account
				</Button>
			</form>
		</>
	);
}
