import { useLocation, useNavigate } from "react-router";
import { authClient } from "../lib/auth";

export default function Login() {
	const nav = useNavigate();
	const location = useLocation();
	const from = (location.state as any)?.from ?? "/";

	async function onSubmit(/* ... */) {
		await authClient.signIn.email(
			{ email, password },
			{
				onSuccess: () => nav(from, { replace: true }),
			},
		);
	}

	// ...

	return (
		<>
			<h1>Log In</h1>
		</>
	);
}
