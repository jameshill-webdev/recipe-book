import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LOADING_SPINNER_ARIA_LABEL } from "@/lib/content-strings";
import { LoadingSpinner } from "./loading-spinner";

describe("LoadingSpinner", () => {
	it("renders the loading spinner", () => {
		render(<LoadingSpinner />);

		expect(screen.getByRole("status", { name: LOADING_SPINNER_ARIA_LABEL }));
	});
});
