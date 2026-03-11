import { z } from "zod";
import {
	DISPLAY_NAME_REQUIRED,
	DISPLAY_NAME_TOO_LONG,
	DISPLAY_NAME_TOO_SHORT,
	EMAIL_REQUIRED,
	INVALID_EMAIL,
	PASSWORD_REQUIRED,
	PASSWORD_TOO_LONG,
	PASSWORD_TOO_SHORT,
} from "../content-strings";
import {
	MINIMUM_PASSWORD_LENGTH,
	MAXIMUM_PASSWORD_LENGTH,
	MAXIMUM_DISPLAY_NAME_LENGTH,
	MINIMUM_DISPLAY_NAME_LENGTH,
} from "@recipe-book/shared/lib/constants";

export const emailFieldSchema = z
	.string()
	.trim()
	.min(1, EMAIL_REQUIRED)
	.pipe(z.email({ message: INVALID_EMAIL }));

export const passwordFieldSchema = z
	.string()
	.trim()
	.min(1, PASSWORD_REQUIRED)
	.min(MINIMUM_PASSWORD_LENGTH, PASSWORD_TOO_SHORT)
	.max(MAXIMUM_PASSWORD_LENGTH, PASSWORD_TOO_LONG);

export const displayNameFieldSchema = z
	.string()
	.trim()
	.min(1, DISPLAY_NAME_REQUIRED)
	.min(MINIMUM_DISPLAY_NAME_LENGTH, DISPLAY_NAME_TOO_SHORT)
	.max(MAXIMUM_DISPLAY_NAME_LENGTH, DISPLAY_NAME_TOO_LONG);
