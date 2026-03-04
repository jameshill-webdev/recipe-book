import {
	MINIMUM_PASSWORD_LENGTH,
	MAXIMUM_PASSWORD_LENGTH,
	MINIMUM_DISPLAY_NAME_LENGTH,
	MAXIMUM_DISPLAY_NAME_LENGTH,
} from "./constants";

export const networkError =
	"We couldn't reach the server. There may be an issue with the server or your internet connection.";
export const invalidEmail = "Please enter a valid email address.";
export const passwordTooShort = `Password must be at least ${MINIMUM_PASSWORD_LENGTH} characters.`;
export const passwordTooLong = `Password cannot be longer than ${MAXIMUM_PASSWORD_LENGTH} characters.`;
export const displayNameTooShort = `Display name must be at least ${MINIMUM_DISPLAY_NAME_LENGTH} characters.`;
export const displayNameTooLong = `Display name cannot be longer than ${MAXIMUM_DISPLAY_NAME_LENGTH} characters.`;
export const genericError = "Something went wrong.";
