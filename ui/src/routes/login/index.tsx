import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { authClient } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { InlineError } from "@/components/ui/error";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	FIELD_LABEL_EMAIL,
	FIELD_LABEL_PASSWORD,
	FORGOT_PASSWORD_LINK_TEXT,
	GENERIC_LOADING,
	LOGIN_BUTTON_TEXT,
	LOGIN_FORM_LABEL,
	LOGIN_PAGE_HEADING,
	LOGOUT_SUCCESS,
	SIGNUP_LINK_TEXT,
} from "@/lib/content-strings";

export default function Login() {
	const navigate = useNavigate();
	const location = useLocation();
	const { data: session, isPending } = authClient.useSession();
	const from = (location.state as any)?.from ?? "/";
	const didLogout = Boolean((location.state as any)?.loggedOut);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);

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
		setError(null);

		await authClient.signIn.email(
			{ email, password },
			{
				onError: (ctx) => setError(ctx.error.message ?? "Something went wrong"),
				onSuccess: () => navigate(from, { replace: true }),
			},
		);
	}

	return (
		<>
			<h1>{LOGIN_PAGE_HEADING}</h1>
			<form
				onSubmit={onSubmit}
				className="mx-auto w-full max-w-lg flex flex-col gap-6"
				aria-label={LOGIN_FORM_LABEL}
			>
				{/* TODO: refactor logout message to use shadcn alert/notification component if available (or custom equivalent if not) */}
				{didLogout && <p>{LOGOUT_SUCCESS}</p>}{" "}
				<Field>
					<FieldLabel htmlFor="email">{FIELD_LABEL_EMAIL}</FieldLabel>
					<Input
						id="email"
						type="email"
						autoComplete="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder={FIELD_LABEL_EMAIL}
						required
					/>
				</Field>
				<Field>
					<FieldLabel htmlFor="password">{FIELD_LABEL_PASSWORD}</FieldLabel>
					<Input
						id="password"
						type="password"
						autoComplete="current-password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder={FIELD_LABEL_PASSWORD}
						required
					/>
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
				{error && <InlineError alert>{error}</InlineError>}
			</form>
		</>
	);
}
