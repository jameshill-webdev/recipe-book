import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Navigation from "@/components/navigation";

const useSessionMock = vi.fn();
const signOutMock = vi.fn();

vi.mock("@/lib/auth", () => ({
	authClient: {
		useSession: () => useSessionMock(),
		signOut: (...args: unknown[]) => signOutMock(...args),
	},
}));

describe("Navigation", () => {
	beforeEach(() => {
		useSessionMock.mockReset();
		signOutMock.mockReset();
	});

	it("renders logout button when a session exists", () => {
		useSessionMock.mockReturnValue({
			data: { session: { id: "session-id" } },
			isPending: false,
		});

		render(
			<MemoryRouter>
				<Navigation />
			</MemoryRouter>,
		);

		expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument();
	});

	it.only("calls signOut when logout button is clicked", async () => {
		useSessionMock.mockReturnValue({
			data: { session: { id: "session-id" } },
			isPending: false,
		});
		signOutMock.mockResolvedValue({ error: null });

		render(
			<MemoryRouter>
				<Navigation />
			</MemoryRouter>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Log out" }));

		expect(signOutMock).toHaveBeenCalledTimes(1);
	});
});
