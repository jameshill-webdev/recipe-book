import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { authClient } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { InlineError } from "@/components/ui/error";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { GENERIC_LOADING, LOGIN_FORM_LABEL, LOGOUT_SUCCESS } from "@/lib/messages";

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
			<h1>Log In</h1>
			<form
				onSubmit={onSubmit}
				className="mx-auto w-full max-w-lg flex flex-col gap-6"
				aria-label={LOGIN_FORM_LABEL}
			>
				{/* TODO: refactor logout message to use shadcn alert/notification component if available (or custom equivalent if not) */}
				{didLogout && <p>{LOGOUT_SUCCESS}</p>}{" "}
				<Field>
					<FieldLabel htmlFor="email">Email</FieldLabel>
					<Input
						id="email"
						type="email"
						autoComplete="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Email"
						required
					/>
				</Field>
				<Field>
					<FieldLabel htmlFor="password">Password</FieldLabel>
					<Input
						id="password"
						type="password"
						autoComplete="current-password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Password"
						required
					/>
				</Field>
				<Button type="submit" className="mt-4">
					Log In
				</Button>
				{error && <InlineError alert>{error}</InlineError>}
			</form>
		</>
	);
}
