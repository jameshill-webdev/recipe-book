import {
	MINIMUM_PASSWORD_LENGTH,
	MAXIMUM_PASSWORD_LENGTH,
	MINIMUM_DISPLAY_NAME_LENGTH,
	MAXIMUM_DISPLAY_NAME_LENGTH,
} from "./constants";

export const NETWORK_ERROR =
	"We couldn't reach the server. There may be an issue with the server or your internet connection.";
export const INVALID_EMAIL = "Please enter a valid email address.";
export const PASSWORD_TOO_SHORT = `Password must be at least ${MINIMUM_PASSWORD_LENGTH} characters.`;
export const PASSWORD_TOO_LONG = `Password cannot be longer than ${MAXIMUM_PASSWORD_LENGTH} characters.`;
export const DISPLAY_NAME_TOO_SHORT = `Display name must be at least ${MINIMUM_DISPLAY_NAME_LENGTH} characters.`;
export const DISPLAY_NAME_TOO_LONG = `Display name cannot be longer than ${MAXIMUM_DISPLAY_NAME_LENGTH} characters.`;
export const GENERIC_ERROR = "Something went wrong.";
export const LOGOUT_FAILED = "We couldn't log you out. Please try again.";
export const LOGOUT_SUCCESS = "You have been logged out successfully.";
export const GENERIC_LOADING = "Loading...";
export const LOGIN_FORM_LABEL = "Login form";
export const LOGIN_BUTTON_TEXT = "Log in";
export const LOGOUT_BUTTON_TEXT = "Log out";
export const SIGNUP_BUTTON_TEXT = "Sign up";
export const NAVIGATION_LINK_TEXT_HOME = "Home";
export const NAVIGATION_LINK_TEXT_INGREDIENTS = "Ingredients";
export const NAVIGATION_LINK_TEXT_RECIPES = "Recipes";
export const GLOBAL_ERROR_ALERT_LABEL = "Global error alert";
export const GLOBAL_ERROR_ALERT_TITLE = "There was a problem";
export const GLOBAL_ERROR_ALERT_DISMISS_BUTTON_LABEL = "Dismiss global error";
export const GLOBAL_ERROR_ALERT_DISMISS_BUTTON_TEXT = "Dismiss";
