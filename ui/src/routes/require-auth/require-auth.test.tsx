import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RequireAuth } from "@/routes/require-auth";
import * as auth from "@/lib/auth";

vi.mock("@/lib/auth", () => ({
	authClient: {
		useSession: vi.fn(),
	},
}));

const mockUseSession = vi.mocked(auth.authClient.useSession);

type UseSessionResult = ReturnType<typeof auth.authClient.useSession>;

function createUseSessionResult(overrides: Partial<UseSessionResult> = {}): UseSessionResult {
	return {
		data: null,
		isPending: false,
		isRefetching: false,
		error: null,
		refetch: vi.fn(async () => {}),
		...overrides,
	};
}

beforeEach(() => {
	mockUseSession.mockReset();
	mockUseSession.mockReturnValue(createUseSessionResult());
});

describe("RequireAuth", () => {
	describe("loading state", () => {
		beforeEach(() => {
			mockUseSession.mockReturnValue(createUseSessionResult({ isPending: true }));
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
			mockUseSession.mockReturnValue(
				createUseSessionResult({
					data: { user: { id: "123" } } as UseSessionResult["data"],
				}),
			);
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

	describe("unauthenticated state", () => {
		beforeEach(() => {
			mockUseSession.mockReturnValue(createUseSessionResult({ data: null }));
		});

		it("redirects to login when session is not authenticated", () => {
			const ChildComponent = () => <div>Protected content</div>;
			render(
				<MemoryRouter initialEntries={["/protected"]}>
					<Routes>
						<Route element={<RequireAuth />}>
							<Route path="/protected" element={<ChildComponent />} />
						</Route>
						<Route path="/login" element={<div>Login page</div>} />
					</Routes>
				</MemoryRouter>,
			);
			expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
			expect(screen.getByText("Login page")).toBeInTheDocument();
		});
	});
});
