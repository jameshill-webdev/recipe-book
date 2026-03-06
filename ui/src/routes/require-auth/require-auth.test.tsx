import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import { RequireAuth } from "@/routes/require-auth";
import { GENERIC_LOADING } from "@/lib/content-strings";

vi.mock("@/lib/auth", () => ({
	authClient: {
		useSession: () => ({ data: null, isPending: true }),
	},
}));

describe("RequireAuth", () => {
	it("renders text", () => {
		render(
			<MemoryRouter>
				<RequireAuth />
			</MemoryRouter>,
		);
		expect(screen.getByText(GENERIC_LOADING)).toBeInTheDocument();
	});
});
