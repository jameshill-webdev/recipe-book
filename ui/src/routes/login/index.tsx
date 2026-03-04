import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authClient } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function Login() {
	const nav = useNavigate();
	const location = useLocation();
	const from = (location.state as any)?.from ?? "/";
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);

		await authClient.signIn.email(
			{ email, password },
			{
				onError: (ctx) => setError(ctx.error.message ?? "Something went wrong"),
				onSuccess: () => nav(from, { replace: true }),
			},
		);
	}

	return (
		<>
			<h1>Log In</h1>
			<form onSubmit={onSubmit} className="mx-auto w-full max-w-lg flex flex-col gap-6">
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
				{error && <FieldError>{error}</FieldError>}
			</form>
		</>
	);
}
