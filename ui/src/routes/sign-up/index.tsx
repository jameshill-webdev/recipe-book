import { useState } from "react";
import { authClient } from "@/lib/auth";
import { useNavigate } from "react-router";

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

		// TODO: this currently sends the verification email twice due to better-auth's default behaviour of auto-sending on signup (plus this manual call). One option is to remove this manual call, but then the same callbackURL will be used for both signup (i.e. "verify your email") and after verification (i.e. "your email was verified"), which is not best-practice and creates complications regarding logic in that route/page to determine whether the user has verified yet. So, the preferred option is to add `sendOnSignUp: false,` to the better-auth config to disable the auto-sending, and rely on this instead, which makes it easy to have separate routes/callbackURLs for each state.
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
		<form onSubmit={onSubmit}>
			<input
				value={email}
				onChange={(error) => setEmail(error.target.value)}
				placeholder="Email"
			/>
			<input
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				placeholder="Password"
				type="password"
			/>
			<input
				value={name}
				onChange={(error) => setName(error.target.value)}
				placeholder="Display name"
			/>
			<button type="submit">Create account</button>
			{error && <div>{error}</div>}
		</form>
	);
}
