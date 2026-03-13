import { useContext } from "react";
import { GlobalErrorStoreContext } from "@/lib/global-error-context";

export function useGlobalErrorStore() {
	const context = useContext(GlobalErrorStoreContext);

	if (!context) {
		throw new Error("useGlobalErrorStore must be used within a GlobalErrorProvider");
	}

	return context;
}
