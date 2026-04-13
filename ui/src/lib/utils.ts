import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { GENERIC_ERROR, NETWORK_ERROR } from "@/lib/content-strings";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getErrorMessage(error: unknown) {
	if (error instanceof TypeError) {
		return NETWORK_ERROR;
	}

	return error instanceof Error ? error.message : GENERIC_ERROR;
}
