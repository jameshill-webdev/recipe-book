import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RequireAuth } from "@/routes/require-auth";

const mockUseSession = vi.fn();

vi.mock("@/lib/auth", () => ({
	authClient: {
		useSession: () => mockUseSession(),
	},
}));

describe("RequireAuth", () => {
	describe("loading state", () => {
		beforeEach(() => {
			mockUseSession.mockReturnValue({ data: null, isPending: true });
		});

		it("renders loading message when session is pending", () => {
			const ChildComponent = () => <div>Protected content</div>;
			render(
				<MemoryRouter initialEntries={["/protected"]}>
					<Routes>
						<Route element={<RequireAuth />}>
							<Route path="/protected" element={<ChildComponent />} />
						</Route>
					</Routes>
				</MemoryRouter>,
			);
			expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
			expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
		});
	});

	describe("authenticated state", () => {
		beforeEach(() => {
			mockUseSession.mockReturnValue({ data: { user: { id: "123" } }, isPending: false });
		});

		it("renders outlet when session is authenticated", () => {
			const ChildComponent = () => <div>Protected content</div>;
			render(
				<MemoryRouter initialEntries={["/protected"]}>
					<Routes>
						<Route element={<RequireAuth />}>
							<Route path="/protected" element={<ChildComponent />} />
						</Route>
					</Routes>
				</MemoryRouter>,
			);
			expect(screen.getByText("Protected content")).toBeInTheDocument();
		});
	});
});
