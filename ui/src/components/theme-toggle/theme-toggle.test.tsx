import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "@/components/theme-toggle/theme-toggle";
import {
	THEME_TOGGLE_LABEL,
	THEME_TOGGLE_OPTION_DARK,
	THEME_TOGGLE_OPTION_LIGHT,
	THEME_TOGGLE_OPTION_SYSTEM,
} from "@/lib/content-strings";
import { type Theme } from "@/lib/theme-context";
import { ThemeProvider } from "@/providers/theme-provider";

const TEST_STORAGE_KEY = "theme-toggle-test-theme";

function mockMatchMedia(matches: boolean) {
	Object.defineProperty(window, "matchMedia", {
		writable: true,
		value: vi.fn().mockImplementation((query: string) => ({
			matches,
			media: query,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		})),
	});
}

function renderThemeToggle(defaultTheme: Theme = "light") {
	return render(
		<ThemeProvider defaultTheme={defaultTheme} storageKey={TEST_STORAGE_KEY}>
			<ThemeToggle />
		</ThemeProvider>,
	);
}

function openThemeMenu() {
	const toggleButton = screen.getByRole("button", { name: THEME_TOGGLE_LABEL });

	fireEvent.pointerDown(toggleButton, { button: 0, ctrlKey: false });

	return toggleButton;
}

describe("ThemeToggle", () => {
	beforeEach(() => {
		localStorage.clear();
		document.documentElement.className = "";
		mockMatchMedia(false);
	});

	it("renders a theme toggle button and reveals the available theme options", async () => {
		renderThemeToggle();

		const toggleButton = openThemeMenu();

		expect(toggleButton).toBeInTheDocument();

		expect(
			await screen.findByRole("menuitem", { name: THEME_TOGGLE_OPTION_LIGHT }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("menuitem", { name: THEME_TOGGLE_OPTION_DARK }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("menuitem", { name: THEME_TOGGLE_OPTION_SYSTEM }),
		).toBeInTheDocument();
	});

	it.each([
		[THEME_TOGGLE_OPTION_LIGHT, "light"],
		[THEME_TOGGLE_OPTION_DARK, "dark"],
	] as const)("applies the %s theme when selected", async (optionLabel, expectedTheme) => {
		renderThemeToggle("system");

		openThemeMenu();
		fireEvent.click(await screen.findByRole("menuitem", { name: optionLabel }));

		await waitFor(() => {
			expect(document.documentElement).toHaveClass(expectedTheme);
		});

		expect(localStorage.getItem(TEST_STORAGE_KEY)).toBe(expectedTheme);
	});

	it("applies the system theme preference and persists the system setting", async () => {
		mockMatchMedia(true);
		renderThemeToggle("light");

		openThemeMenu();
		fireEvent.click(await screen.findByRole("menuitem", { name: THEME_TOGGLE_OPTION_SYSTEM }));

		await waitFor(() => {
			expect(document.documentElement).toHaveClass("dark");
		});

		expect(localStorage.getItem(TEST_STORAGE_KEY)).toBe("system");
	});
});
