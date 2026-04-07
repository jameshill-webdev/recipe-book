import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserMenu } from "@/components/user-menu/user-menu";
import { useGlobalErrorStore } from "@/hooks/use-global-error-store";
import { GlobalErrorProvider } from "@/providers/global-error-provider";
import {
	GENERIC_LOADING,
	LOGIN_BUTTON_TEXT,
	LOGOUT_BUTTON_TEXT,
	LOGOUT_FAILED,
	NETWORK_ERROR,
} from "@/lib/content-strings";

const signOutMock = vi.fn();
const useSessionMock = vi.fn();
const navigateMock = vi.fn();

function GlobalErrorStoreProbe() {
	const { errorMessage } = useGlobalErrorStore();

	return <div data-testid="global-error-message">{errorMessage}</div>;
}

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

function renderUserMenu() {
	return render(
		<MemoryRouter>
			<GlobalErrorProvider>
				<GlobalErrorStoreProbe />
				<UserMenu />
			</GlobalErrorProvider>
		</MemoryRouter>,
	);
}

describe("UserMenu", () => {
	const TEST_DATA = { user: { name: "TheUser" } };

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

		renderUserMenu();

		expect(screen.getByText(GENERIC_LOADING)).toBeInTheDocument();
		expect(screen.queryByText(TEST_DATA.user.name)).not.toBeInTheDocument();
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("renders login button and no user name when no session exists", () => {
		useSessionMock.mockReturnValue({
			data: null,
			isPending: false,
		});

		renderUserMenu();

		expect(screen.getByRole("link", { name: LOGIN_BUTTON_TEXT })).toBeInTheDocument();
		expect(screen.queryByText(TEST_DATA.user.name)).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: LOGOUT_BUTTON_TEXT })).not.toBeInTheDocument();
	});

	it("renders user name and logout button when a session exists", () => {
		useSessionMock.mockReturnValue({
			data: { user: TEST_DATA.user },
			isPending: false,
		});

		renderUserMenu();

		expect(screen.getByText(TEST_DATA.user.name)).toBeInTheDocument();
		expect(screen.getByRole("button", { name: LOGOUT_BUTTON_TEXT })).toBeInTheDocument();
		expect(screen.queryByRole("link", { name: LOGIN_BUTTON_TEXT })).not.toBeInTheDocument();
	});

	it("calls signOut and navigates to the login page when logout button is clicked", async () => {
		useSessionMock.mockReturnValue({
			data: { user: TEST_DATA.user },
			isPending: false,
		});
		signOutMock.mockResolvedValue({ error: null });

		renderUserMenu();

		fireEvent.click(screen.getByRole("button", { name: LOGOUT_BUTTON_TEXT }));

		expect(signOutMock).toHaveBeenCalledTimes(1);

		await waitFor(() => {
			expect(navigateMock).toHaveBeenCalledWith("/login", {
				replace: true,
				state: { loggedOut: true },
			});
			expect(screen.getByTestId("global-error-message")).not.toHaveTextContent(/\S/);
		});
	});

	it("sets API error message in global error store when sign out fails", async () => {
		const signoutFailedMessage = "Sign out failed";

		useSessionMock.mockReturnValue({
			data: { user: TEST_DATA.user },
			isPending: false,
		});
		signOutMock.mockResolvedValue({ error: { message: signoutFailedMessage } });

		renderUserMenu();

		fireEvent.click(screen.getByRole("button", { name: LOGOUT_BUTTON_TEXT }));

		await waitFor(() => {
			expect(screen.getByTestId("global-error-message")).toHaveTextContent(
				signoutFailedMessage,
			);
		});
	});

	it("sets default logout error in global error store when API error has no message", async () => {
		useSessionMock.mockReturnValue({
			data: { user: TEST_DATA.user },
			isPending: false,
		});
		signOutMock.mockResolvedValue({ error: {} });

		renderUserMenu();

		fireEvent.click(screen.getByRole("button", { name: LOGOUT_BUTTON_TEXT }));

		await waitFor(() => {
			expect(screen.getByTestId("global-error-message")).toHaveTextContent(LOGOUT_FAILED);
		});
	});

	it("sets network error in global error store when sign out throws", async () => {
		useSessionMock.mockReturnValue({
			data: { user: TEST_DATA.user },
			isPending: false,
		});
		signOutMock.mockRejectedValue(new Error("network"));

		renderUserMenu();

		fireEvent.click(screen.getByRole("button", { name: LOGOUT_BUTTON_TEXT }));

		await waitFor(() => {
			expect(screen.getByTestId("global-error-message")).toHaveTextContent(NETWORK_ERROR);
		});
	});
});
