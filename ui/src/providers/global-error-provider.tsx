import { useMemo, useState, type ReactNode } from "react";
import { GlobalErrorStoreContext, type GlobalErrorStoreValue } from "@/lib/global-error-context";

export function GlobalErrorProvider({ children }: { children: ReactNode }) {
	const [errorMessage, setErrorMessageState] = useState<string | null>(null);

	const value = useMemo<GlobalErrorStoreValue>(
		() => ({
			errorMessage,
			setErrorMessage: (message: string) => setErrorMessageState(message),
			clearErrorMessage: () => setErrorMessageState(null),
		}),
		[errorMessage],
	);

	return (
		<GlobalErrorStoreContext.Provider value={value}>
			{children}
		</GlobalErrorStoreContext.Provider>
	);
}
