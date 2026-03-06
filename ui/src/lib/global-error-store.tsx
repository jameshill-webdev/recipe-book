import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type GlobalErrorStoreValue = {
	errorMessage: string | null;
	setErrorMessage: (message: string) => void;
	clearErrorMessage: () => void;
};

const GlobalErrorStoreContext = createContext<GlobalErrorStoreValue | undefined>(undefined);

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

export function useGlobalErrorStore() {
	const context = useContext(GlobalErrorStoreContext);

	if (!context) {
		throw new Error("useGlobalErrorStore must be used within a GlobalErrorProvider");
	}

	return context;
}
