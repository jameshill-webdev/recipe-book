import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import ForgotPassword from "@/routes/forgot-password";
import {
	EMAIL_REQUIRED,
	FIELD_LABEL_EMAIL,
	FORGOT_PASSWORD_BUTTON_TEXT,
	FORGOT_PASSWORD_FORM_LABEL,
	FORGOT_PASSWORD_PAGE_HEADING,
	INVALID_EMAIL,
} from "@/lib/content-strings";

describe("Forgot Password", () => {
	it("renders a level 1 heading with the correct text content", () => {
		render(
			<MemoryRouter>
				<ForgotPassword />
			</MemoryRouter>,
		);
		expect(
			screen.getByRole("heading", { level: 1, name: FORGOT_PASSWORD_PAGE_HEADING }),
		).toBeInTheDocument();
	});

	it("renders a forgot password form", () => {
		render(
			<MemoryRouter>
				<ForgotPassword />
			</MemoryRouter>,
		);

		expect(screen.getByRole("form", { name: FORGOT_PASSWORD_FORM_LABEL })).toBeInTheDocument();
	});

	it("renders email field with correct label", () => {
		render(
			<MemoryRouter>
				<ForgotPassword />
			</MemoryRouter>,
		);

		expect(screen.getByText(FIELD_LABEL_EMAIL)).toBeInTheDocument();
		expect(screen.getByRole("textbox", { name: FIELD_LABEL_EMAIL })).toBeInTheDocument();
	});

	it("renders a submit button with the correct text", () => {
		render(
			<MemoryRouter>
				<ForgotPassword />
			</MemoryRouter>,
		);

		expect(
			screen.getByRole("button", { name: FORGOT_PASSWORD_BUTTON_TEXT }),
		).toBeInTheDocument();
	});

	describe("form validation", () => {
		const TEST_DATA = {
			valid: {
				email: "test@email.com",
			},
			invalid: {
				email: "invalidemail",
			},
		};

		// TODO: add network error test once forgot password functionality is implemented
		// TODO: refactor tests to ensure API calls are skipped, once forgot password functionality is implemented
		it("shows the correct validation error when email is missing", () => {
			render(
				<MemoryRouter>
					<ForgotPassword />
				</MemoryRouter>,
			);

			fireEvent.submit(screen.getByRole("button", { name: FORGOT_PASSWORD_BUTTON_TEXT }));

			expect(screen.getByText(EMAIL_REQUIRED)).toBeInTheDocument();
		});

		it("shows the correct validation error when email is invalid", () => {
			render(
				<MemoryRouter>
					<ForgotPassword />
				</MemoryRouter>,
			);

			fireEvent.change(screen.getByLabelText(FIELD_LABEL_EMAIL), {
				target: { value: TEST_DATA.invalid.email },
			});
			fireEvent.submit(screen.getByRole("button", { name: FORGOT_PASSWORD_BUTTON_TEXT }));

			expect(screen.getByText(INVALID_EMAIL)).toBeInTheDocument();
		});

		it("clears the email validation error when the field changes", () => {
			render(
				<MemoryRouter>
					<ForgotPassword />
				</MemoryRouter>,
			);

			fireEvent.submit(screen.getByRole("button", { name: FORGOT_PASSWORD_BUTTON_TEXT }));
			expect(screen.getByText(EMAIL_REQUIRED)).toBeInTheDocument();

			fireEvent.change(screen.getByLabelText(FIELD_LABEL_EMAIL), {
				target: { value: TEST_DATA.valid.email },
			});

			expect(screen.queryByText(EMAIL_REQUIRED)).not.toBeInTheDocument();
		});
	});
});
