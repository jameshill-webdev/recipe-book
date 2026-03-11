import {
	MINIMUM_PASSWORD_LENGTH,
	MAXIMUM_PASSWORD_LENGTH,
	MINIMUM_DISPLAY_NAME_LENGTH,
	MAXIMUM_DISPLAY_NAME_LENGTH,
} from "@recipe-book/shared/lib/constants";

export const NETWORK_ERROR =
	"We couldn't reach the server. There may be an issue with the server or your internet connection.";
export const EMAIL_REQUIRED = "Email is required.";
export const PASSWORD_REQUIRED = "Password is required.";
export const DISPLAY_NAME_REQUIRED = "Display name is required.";
export const INVALID_EMAIL = "Please enter a valid email address.";
export const PASSWORD_TOO_SHORT = `Password must be at least ${MINIMUM_PASSWORD_LENGTH} characters.`;
export const PASSWORD_TOO_LONG = `Password cannot be longer than ${MAXIMUM_PASSWORD_LENGTH} characters.`;
export const DISPLAY_NAME_TOO_SHORT = `Display name must be at least ${MINIMUM_DISPLAY_NAME_LENGTH} characters.`;
export const DISPLAY_NAME_TOO_LONG = `Display name cannot be longer than ${MAXIMUM_DISPLAY_NAME_LENGTH} characters.`;
export const GENERIC_ERROR = "Something went wrong.";
export const LOGOUT_FAILED = "We couldn't log you out. Please try again.";
export const LOGOUT_SUCCESS = "You have been logged out successfully.";
export const GENERIC_LOADING = "Loading...";
export const NOT_FOUND_PAGE_HEADING = "Page Not Found";
export const NOT_FOUND_PAGE_MESSAGE = "The page does not exist.";
export const HOME_PAGE_HEADING = "Home";
export const INGREDIENTS_PAGE_HEADING = "Ingredients";
export const RECIPES_PAGE_HEADING = "Recipes";
export const LOGIN_PAGE_HEADING = "Log in";
export const LOGIN_FORM_LABEL = "Login form";
export const LOGIN_BUTTON_TEXT = "Log in";
export const LOGOUT_BUTTON_TEXT = "Log out";
export const SIGNUP_PAGE_HEADING = "Create an account";
export const SIGNUP_FORM_LABEL = "Signup form";
export const FIELD_LABEL_EMAIL = "Email";
export const FIELD_LABEL_PASSWORD = "Password";
export const FIELD_LABEL_DISPLAY_NAME = "Display name";
export const FIELD_LABEL_NEW_PASSWORD = "New password";
export const FIELD_LABEL_CONFIRM_PASSWORD = "Confirm password";
export const SIGNUP_BUTTON_TEXT = "Sign up";
export const RESET_PASSWORD_PAGE_HEADING = "Reset your password";
export const RESET_PASSWORD_FORM_LABEL = "Reset password form";
export const RESET_PASSWORD_BUTTON_TEXT = "Send reset link";
export const VERIFY_EMAIL_PAGE_HEADING = "Check your email";
export const VERIFY_EMAIL_PAGE_MESSAGE =
	"We have sent a verification email. Please follow the link contained in the email to verify your email address. Your email must be verified before you can log in.";
export const NAVIGATION_LINK_TEXT_HOME = "Home";
export const NAVIGATION_LINK_TEXT_INGREDIENTS = "Ingredients";
export const NAVIGATION_LINK_TEXT_RECIPES = "Recipes";
export const GLOBAL_ERROR_ALERT_LABEL = "Global error alert";
export const GLOBAL_ERROR_ALERT_TITLE = "There was a problem";
export const GLOBAL_ERROR_ALERT_DISMISS_BUTTON_LABEL = "Dismiss global error";
export const GLOBAL_ERROR_ALERT_DISMISS_BUTTON_TEXT = "Dismiss";
export const FORGOT_PASSWORD_LINK_TEXT = "Forgot your password?";
export const SIGNUP_LINK_TEXT = "Don't have an account? Sign up";
export const LOGIN_LINK_TEXT = "Already have an account? Log in";
export const FORGOT_PASSWORD_PAGE_HEADING = "Reset your password";
export const FORGOT_PASSWORD_FORM_LABEL = "Forgot password form";
export const FORGOT_PASSWORD_BUTTON_TEXT = "Send reset link";
export const THEME_TOGGLE_LABEL = "Toggle theme";
export const THEME_TOGGLE_OPTION_LIGHT = "Light";
export const THEME_TOGGLE_OPTION_DARK = "Dark";
export const THEME_TOGGLE_OPTION_SYSTEM = "System";
