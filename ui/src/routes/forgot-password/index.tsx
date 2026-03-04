import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function ForgotPassword() {
	const [email, setEmail] = useState("");

	function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
	}

	return (
		<>
			<h1>Forgot Password</h1>
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
				<Button type="submit" className="mt-4">
					Send reset link
				</Button>
			</form>
		</>
	);
}
