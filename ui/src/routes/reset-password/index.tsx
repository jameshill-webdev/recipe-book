import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	FIELD_LABEL_CONFIRM_PASSWORD,
	FIELD_LABEL_NEW_PASSWORD,
	RESET_PASSWORD_BUTTON_TEXT,
	RESET_PASSWORD_PAGE_HEADING,
} from "@/lib/content-strings";

export default function ResetPassword() {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
	}

	return (
		<>
			<h1>{RESET_PASSWORD_PAGE_HEADING}</h1>
			<form onSubmit={onSubmit} className="mx-auto w-full max-w-lg flex flex-col gap-6">
				<Field>
					<FieldLabel htmlFor="password">{FIELD_LABEL_NEW_PASSWORD}</FieldLabel>
					<Input
						id="password"
						type="password"
						autoComplete="new-password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder={FIELD_LABEL_NEW_PASSWORD}
						required
					/>
				</Field>
				<Field>
					<FieldLabel htmlFor="confirm-password">
						{FIELD_LABEL_CONFIRM_PASSWORD}
					</FieldLabel>
					<Input
						id="confirm-password"
						type="password"
						autoComplete="new-password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						placeholder={FIELD_LABEL_CONFIRM_PASSWORD}
						required
					/>
				</Field>
				<Button type="submit" className="mt-4">
					{RESET_PASSWORD_BUTTON_TEXT}
				</Button>
			</form>
		</>
	);
}
