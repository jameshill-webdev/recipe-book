import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function ResetPassword() {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
	}

	return (
		<>
			<h1>Reset Password</h1>
			<form onSubmit={onSubmit} className="mx-auto w-full max-w-lg flex flex-col gap-6">
				<Field>
					<FieldLabel htmlFor="password">New password</FieldLabel>
					<Input
						id="password"
						type="password"
						autoComplete="new-password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="New password"
						required
					/>
				</Field>
				<Field>
					<FieldLabel htmlFor="confirm-password">Confirm password</FieldLabel>
					<Input
						id="confirm-password"
						type="password"
						autoComplete="new-password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						placeholder="Confirm password"
						required
					/>
				</Field>
				<Button type="submit" className="mt-4">
					Reset password
				</Button>
			</form>
		</>
	);
}
