import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	FIELD_LABEL_EMAIL,
	FORGOT_PASSWORD_BUTTON_TEXT,
	FORGOT_PASSWORD_PAGE_HEADING,
} from "@/lib/content-strings";

export default function ForgotPassword() {
	const [email, setEmail] = useState("");

	function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
	}

	return (
		<>
			<h1>{FORGOT_PASSWORD_PAGE_HEADING}</h1>
			<form onSubmit={onSubmit} className="mx-auto w-full max-w-lg flex flex-col gap-6">
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
				<Button type="submit" className="mt-4">
					{FORGOT_PASSWORD_BUTTON_TEXT}
				</Button>
			</form>
		</>
	);
}
