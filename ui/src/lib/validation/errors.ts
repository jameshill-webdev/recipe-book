type ValidationIssue = {
	path: readonly unknown[];
	message: string;
};

export function mapIssuesToFieldErrors<TField extends string>(
	issues: ValidationIssue[],
): Partial<Record<TField, string>> {
	const validationErrors: Partial<Record<TField, string>> = {};

	for (const issue of issues) {
		const field = issue.path[0];

		if (typeof field === "string" && !(field in validationErrors)) {
			validationErrors[field as TField] = issue.message;
		}
	}

	return validationErrors;
}
