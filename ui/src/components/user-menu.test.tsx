import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserMenu } from "@/components/user-menu";
import {
	GENERIC_LOADING,
	LOGIN_BUTTON_TEXT,
	LOGOUT_BUTTON_TEXT,
	LOGOUT_FAILED,
	NETWORK_ERROR,
} from "@/lib/messages";

const signOutMock = vi.fn();
const useSessionMock = vi.fn();
const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
	const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

	return {
		...actual,
		useNavigate: () => navigateMock,
	};
});

vi.mock("@/lib/auth", () => ({
	authClient: {
		useSession: (...args: unknown[]) => useSessionMock(...args),
		signOut: (...args: unknown[]) => signOutMock(...args),
	},
}));

describe("UserMenu", () => {
	const testData = { user: { name: "James" } };

	beforeEach(() => {
		signOutMock.mockReset();
		useSessionMock.mockReset();
		navigateMock.mockReset();
	});

	it("renders loading state and no user name or button when isPending is true", () => {
		useSessionMock.mockReturnValue({
			data: null,
			isPending: true,
		});

		render(
			<MemoryRouter>
				<UserMenu />
			</MemoryRouter>,
		);

		expect(screen.getByText(GENERIC_LOADING)).toBeInTheDocument();
		expect(screen.queryByText(testData.user.name)).not.toBeInTheDocument();
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("renders login button and no user name when no session exists", () => {
		useSessionMock.mockReturnValue({
			data: null,
			isPending: false,
		});

		render(
			<MemoryRouter>
				<UserMenu />
			</MemoryRouter>,
		);

		expect(screen.getByRole("link", { name: LOGIN_BUTTON_TEXT })).toBeInTheDocument();
		expect(screen.queryByText(testData.user.name)).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: LOGOUT_BUTTON_TEXT })).not.toBeInTheDocument();
	});

	it("renders user name and logout button when a session exists", () => {
		useSessionMock.mockReturnValue({
			data: { user: testData.user },
			isPending: false,
		});

		render(
			<MemoryRouter>
				<UserMenu />
			</MemoryRouter>,
		);

		expect(screen.getByText(testData.user.name)).toBeInTheDocument();
		expect(screen.getByRole("button", { name: LOGOUT_BUTTON_TEXT })).toBeInTheDocument();
		expect(screen.queryByRole("link", { name: LOGIN_BUTTON_TEXT })).not.toBeInTheDocument();
	});

	it("calls signOut and navigates to the login page when logout button is clicked", async () => {
		useSessionMock.mockReturnValue({
			data: { user: testData.user },
			isPending: false,
		});
		signOutMock.mockResolvedValue({ error: null });

		render(
			<MemoryRouter>
				<UserMenu />
			</MemoryRouter>,
		);

		fireEvent.click(screen.getByRole("button", { name: LOGOUT_BUTTON_TEXT }));

		expect(signOutMock).toHaveBeenCalledTimes(1);

		await waitFor(() => {
			expect(navigateMock).toHaveBeenCalledWith("/login", {
				replace: true,
				state: { loggedOut: true },
			});
		});
	});

	it("renders API error when sign out fails", async () => {
		const signoutFailedMessage = "Sign out failed";

		useSessionMock.mockReturnValue({
			data: { user: testData.user },
			isPending: false,
		});
		signOutMock.mockResolvedValue({ error: { message: signoutFailedMessage } });

		render(
			<MemoryRouter>
				<UserMenu />
			</MemoryRouter>,
		);

		fireEvent.click(screen.getByRole("button", { name: LOGOUT_BUTTON_TEXT }));

		expect(await screen.findByText(signoutFailedMessage)).toBeInTheDocument();
	});

	it("renders default logout error when API error has no message", async () => {
		useSessionMock.mockReturnValue({
			data: { user: testData.user },
			isPending: false,
		});
		signOutMock.mockResolvedValue({ error: {} });

		render(
			<MemoryRouter>
				<UserMenu />
			</MemoryRouter>,
		);

		fireEvent.click(screen.getByRole("button", { name: LOGOUT_BUTTON_TEXT }));

		expect(await screen.findByText(LOGOUT_FAILED)).toBeInTheDocument();
	});

	it("renders network error when sign out throws", async () => {
		useSessionMock.mockReturnValue({
			data: { user: testData.user },
			isPending: false,
		});
		signOutMock.mockRejectedValue(new Error("network"));

		render(
			<MemoryRouter>
				<UserMenu />
			</MemoryRouter>,
		);

		fireEvent.click(screen.getByRole("button", { name: LOGOUT_BUTTON_TEXT }));

		expect(await screen.findByText(NETWORK_ERROR)).toBeInTheDocument();
	});
});
