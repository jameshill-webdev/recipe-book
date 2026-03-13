import { useState } from "react";
import { z } from "zod";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { authClient } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { InlineError } from "@/components/ui/error";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	EMAIL_VERIFIED_SUCCESS,
	FIELD_LABEL_EMAIL,
	FIELD_LABEL_PASSWORD,
	FORGOT_PASSWORD_LINK_TEXT,
	GENERIC_ERROR,
	GENERIC_LOADING,
	LOGIN_BUTTON_TEXT,
	LOGIN_FORM_LABEL,
	LOGIN_PAGE_HEADING,
	LOGOUT_SUCCESS,
	NETWORK_ERROR,
	PASSWORD_CHANGED_SUCCESS,
	SIGNUP_LINK_TEXT,
} from "@/lib/content-strings";
import { mapIssuesToFieldErrors } from "@/lib/validation/errors";
import { emailFieldSchema, passwordFieldSchema } from "@/lib/validation/fields";

const loginSchema = z.object({
	email: emailFieldSchema,
	password: passwordFieldSchema,
});

type LoginFormValues = z.infer<typeof loginSchema>;
type LoginField = keyof LoginFormValues;
type LoginFieldErrors = Partial<Record<LoginField, string>>;

export default function Login() {
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams] = useSearchParams();
	const { data: session, isPending } = authClient.useSession();
	const from = (location.state as any)?.from ?? "/";
	const loggedOut = Boolean((location.state as any)?.loggedOut);
	const passwordChanged = Boolean((location.state as any)?.passwordChanged);
	const emailVerified = searchParams.get("verified");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [formError, setFormError] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});

	if (isPending) {
		{
			/* TODO: replace with Skeleton or Spinner component */
		}
		return <div>{GENERIC_LOADING}</div>;
	}

	if (session) {
		return <Navigate to="/" replace />;
	}

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFormError(null);
		setFieldErrors({});

		const parsedLoginData = loginSchema.safeParse({
			email,
			password,
		});

		if (!parsedLoginData.success) {
			setFieldErrors(mapIssuesToFieldErrors<LoginField>(parsedLoginData.error.issues));
			return;
		}

		try {
			const { error: loginError } = await authClient.signIn.email(
				{ email, password },
				{
					onError: (ctx) => setFormError(ctx.error.message ?? GENERIC_ERROR),
					onSuccess: () => navigate(from, { replace: true }),
				},
			);

			if (loginError) {
				return setFormError(loginError.message ?? GENERIC_ERROR);
			}
		} catch (error) {
			setFormError(NETWORK_ERROR);
		}
	}

	return (
		<>
			<h1>{LOGIN_PAGE_HEADING}</h1>
			<form
				onSubmit={onSubmit}
				className="mx-auto w-full max-w-lg flex flex-col gap-6"
				aria-label={LOGIN_FORM_LABEL}
			>
				{/* TODO: refactor messages to use shadcn alert/notification component if available (or custom equivalent if not) */}
				{loggedOut && <p>{LOGOUT_SUCCESS}</p>}{" "}
				{passwordChanged && <p>{PASSWORD_CHANGED_SUCCESS}</p>}
				{emailVerified === "1" && <p>{EMAIL_VERIFIED_SUCCESS}</p>}
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
				<Field>
					<FieldLabel htmlFor="password">{FIELD_LABEL_PASSWORD}</FieldLabel>
					<Input
						id="password"
						type="password"
						autoComplete="current-password"
						value={password}
						onChange={(e) => {
							setPassword(e.target.value);
							setFieldErrors((currentErrors) => ({
								...currentErrors,
								password: undefined,
							}));
						}}
						placeholder={FIELD_LABEL_PASSWORD}
						required
					/>
					{fieldErrors.password && (
						<InlineError alert>{fieldErrors.password}</InlineError>
					)}
				</Field>
				<div className="flex flex-col">
					<Button type="submit" className="mt-4 mb-5">
						{LOGIN_BUTTON_TEXT}
					</Button>
					<Button asLink to="/forgot-password" variant="link" className="w-full">
						{FORGOT_PASSWORD_LINK_TEXT}
					</Button>
					<Button asLink to="/signup" variant="link" className="w-full">
						{SIGNUP_LINK_TEXT}
					</Button>
				</div>
				{formError && <InlineError alert>{formError}</InlineError>}
			</form>
		</>
	);
}
