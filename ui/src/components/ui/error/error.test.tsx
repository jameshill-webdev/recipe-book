import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { InlineError } from "@/components/ui/error/error";
import { GENERIC_ERROR } from "@/lib/content-strings";

afterEach(() => {
	cleanup();
});

describe("InlineError", () => {
	it("uses polite live region by default and does not set alert role", () => {
		render(<InlineError>{GENERIC_ERROR}</InlineError>);

		const inlineError = screen.getByText(GENERIC_ERROR);
		expect(inlineError).not.toHaveAttribute("role", "alert");
		expect(inlineError).toHaveAttribute("aria-live", "polite");
	});

	it("sets role alert when alert prop is true", () => {
		render(<InlineError alert>{GENERIC_ERROR}</InlineError>);

		const inlineError = screen.getByText(GENERIC_ERROR);
		expect(inlineError).toHaveAttribute("role", "alert");
		expect(inlineError).not.toHaveAttribute("aria-live");
	});

	it("respects custom role when alert is false", () => {
		render(
			<InlineError role="status" aria-live="assertive">
				{GENERIC_ERROR}
			</InlineError>,
		);

		const inlineError = screen.getByText(GENERIC_ERROR);
		expect(inlineError).toHaveAttribute("role", "status");
		expect(inlineError).toHaveAttribute("aria-live", "assertive");
	});
});
