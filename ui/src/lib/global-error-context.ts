import { createContext } from "react";

export type GlobalErrorStoreValue = {
	errorMessage: string | null;
	setErrorMessage: (message: string) => void;
	clearErrorMessage: () => void;
};

export const GlobalErrorStoreContext = createContext<GlobalErrorStoreValue | undefined>(undefined);
