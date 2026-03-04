import { useState } from "react";
import { authClient } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function SignUp() {
	const navigate = useNavigate();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);

	async function onSubmit(event: React.SubmitEvent) {
		event.preventDefault();
		setError(null);

		const { error: signUpError } = await authClient.signUp.email({
			name,
			email,
			password,
			callbackURL: `${window.location.origin}/verify-email`,
		});

		if (signUpError) {
			return setError(signUpError.message ?? "Something went wrong");
		}

		const { error: verifyError } = await authClient.sendVerificationEmail({
			email,
			callbackURL: `${window.location.origin}/email-verified`,
		});

		if (verifyError) {
			return setError(verifyError.message ?? "Something went wrong");
		}

		navigate("/verify-email?sent=1");
	}

	return (
		<>
			<h1>Sign up</h1>
			<form onSubmit={onSubmit} className="mx-auto w-full max-w-lg flex flex-col gap-6">
				<Field>
					<FieldLabel htmlFor="email">Email</FieldLabel>
					<Input
						id="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						type="email"
						autoComplete="email"
						placeholder="Email"
						required
					/>
				</Field>
				<Field>
					<FieldLabel htmlFor="password">Password</FieldLabel>
					<Input
						id="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Password"
						type="password"
						autoComplete="new-password"
						required
					/>
				</Field>
				<Field>
					<FieldLabel htmlFor="name">Display name</FieldLabel>
					<Input
						id="name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Display name"
						autoComplete="name"
						required
					/>
				</Field>
				<Button type="submit" className="mt-4">
					Create account
				</Button>
				{error && <FieldError>{error}</FieldError>}
			</form>
		</>
	);
}
