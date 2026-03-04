import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { InlineError } from "@/components/ui/error";

afterEach(() => {
	cleanup();
});

describe("InlineError", () => {
	it("uses polite live region by default and does not set alert role", () => {
		render(<InlineError>Something went wrong</InlineError>);

		const inlineError = screen.getByText("Something went wrong");
		expect(inlineError).not.toHaveAttribute("role", "alert");
		expect(inlineError).toHaveAttribute("aria-live", "polite");
	});

	it("sets role alert when alert prop is true", () => {
		render(<InlineError alert>Something went wrong</InlineError>);

		const inlineError = screen.getByText("Something went wrong");
		expect(inlineError).toHaveAttribute("role", "alert");
		expect(inlineError).not.toHaveAttribute("aria-live");
	});

	it("respects custom role when alert is false", () => {
		render(
			<InlineError role="status" aria-live="assertive">
				Something went wrong
			</InlineError>,
		);

		const inlineError = screen.getByText("Something went wrong");
		expect(inlineError).toHaveAttribute("role", "status");
		expect(inlineError).toHaveAttribute("aria-live", "assertive");
	});
});
