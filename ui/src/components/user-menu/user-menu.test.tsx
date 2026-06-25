import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserMenu } from "@/components/user-menu/user-menu";
import { useGlobalErrorStore } from "@/hooks/use-global-error-store";
import { GlobalErrorProvider } from "@/providers/global-error-provider";
import * as auth from "@/lib/auth";
import {
	LOGIN_BUTTON_TEXT,
	LOGOUT_BUTTON_TEXT,
	LOGOUT_FAILED,
	NETWORK_ERROR,
} from "@/lib/content-strings";

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
		useSession: vi.fn(),
		signOut: vi.fn(),
	},
}));

const mockUseSession = vi.mocked(auth.authClient.useSession);
const mockSignOut = vi.mocked(auth.authClient.signOut);

type UseSessionResult = ReturnType<typeof auth.authClient.useSession>;

function createUseSessionResult(overrides: Partial<UseSessionResult> = {}): UseSessionResult {
	return {
		data: null,
		isPending: false,
		...overrides,
	} as UseSessionResult;
}

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
	const TEST_DATA = {
		user: {
			id: "user-123",
			name: "TheUser",
			email: "user@example.com",
			emailVerified: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		session: {
			id: "session-123",
			userId: "user-123",
			token: "token-123",
			expiresAt: new Date(),
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	};

	beforeEach(() => {
		mockUseSession.mockReset();
		mockSignOut.mockReset();
		navigateMock.mockReset();
	});

	it("renders loading state and no user name or button when session is pending", () => {
		mockUseSession.mockReturnValue(createUseSessionResult({ isPending: true }));

		renderUserMenu();

		const skeleton = screen.getByTestId("user-menu").querySelector('[data-slot="skeleton"]');
		expect(skeleton).toBeInTheDocument();
		expect(screen.queryByText(TEST_DATA.user.name)).not.toBeInTheDocument();
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("renders login button and no user name when no session exists", () => {
		mockUseSession.mockReturnValue(createUseSessionResult());

		renderUserMenu();

		expect(screen.getByRole("link", { name: LOGIN_BUTTON_TEXT })).toBeInTheDocument();
		expect(screen.queryByText(TEST_DATA.user.name)).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: LOGOUT_BUTTON_TEXT })).not.toBeInTheDocument();
	});

	it("renders user name and logout button when a session exists", () => {
		mockUseSession.mockReturnValue(
			createUseSessionResult({ data: { user: TEST_DATA.user, session: TEST_DATA.session } }),
		);

		renderUserMenu();

		expect(screen.getByText(TEST_DATA.user.name)).toBeInTheDocument();
		expect(screen.getByRole("button", { name: LOGOUT_BUTTON_TEXT })).toBeInTheDocument();
		expect(screen.queryByRole("link", { name: LOGIN_BUTTON_TEXT })).not.toBeInTheDocument();
	});

	it("calls signOut and navigates to the login page when logout button is clicked", async () => {
		mockUseSession.mockReturnValue(
			createUseSessionResult({ data: { user: TEST_DATA.user, session: TEST_DATA.session } }),
		);
		mockSignOut.mockResolvedValue({ error: null });

		renderUserMenu();

		fireEvent.click(screen.getByRole("button", { name: LOGOUT_BUTTON_TEXT }));

		expect(mockSignOut).toHaveBeenCalledTimes(1);

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

		mockUseSession.mockReturnValue(
			createUseSessionResult({ data: { user: TEST_DATA.user, session: TEST_DATA.session } }),
		);
		mockSignOut.mockResolvedValue({
			error: { message: signoutFailedMessage },
		});

		renderUserMenu();

		fireEvent.click(screen.getByRole("button", { name: LOGOUT_BUTTON_TEXT }));

		await waitFor(() => {
			expect(screen.getByTestId("global-error-message")).toHaveTextContent(
				signoutFailedMessage,
			);
		});
	});

	it("sets default logout error in global error store when sign out fails with no error message", async () => {
		mockUseSession.mockReturnValue(
			createUseSessionResult({ data: { user: TEST_DATA.user, session: TEST_DATA.session } }),
		);
		mockSignOut.mockResolvedValue({ error: {} });

		renderUserMenu();

		fireEvent.click(screen.getByRole("button", { name: LOGOUT_BUTTON_TEXT }));

		await waitFor(() => {
			expect(screen.getByTestId("global-error-message")).toHaveTextContent(LOGOUT_FAILED);
		});
	});

	it("sets network error in global error store when sign out throws", async () => {
		mockUseSession.mockReturnValue(
			createUseSessionResult({ data: { user: TEST_DATA.user, session: TEST_DATA.session } }),
		);
		mockSignOut.mockRejectedValue(new Error("network"));

		renderUserMenu();

		fireEvent.click(screen.getByRole("button", { name: LOGOUT_BUTTON_TEXT }));

		await waitFor(() => {
			expect(screen.getByTestId("global-error-message")).toHaveTextContent(NETWORK_ERROR);
		});
	});
});
