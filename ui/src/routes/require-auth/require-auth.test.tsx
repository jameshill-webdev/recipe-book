import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, it, expect, vi } from "vitest";
import { RequireAuth } from "@/routes/require-auth";

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
		expect(screen.getByText("Loading…")).toBeInTheDocument();
	});
});
