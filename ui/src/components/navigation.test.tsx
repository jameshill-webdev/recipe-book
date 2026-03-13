import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Navigation } from "@/components/navigation";
import {
	NAVIGATION_LINK_TEXT_HOME,
	NAVIGATION_LINK_TEXT_INGREDIENTS,
	NAVIGATION_LINK_TEXT_RECIPES,
} from "@/lib/content-strings";
import { ThemeProvider } from "@/providers/theme-provider";

vi.mock("@/components/user-menu", () => ({
	UserMenu: () => <div data-testid="user-menu" />,
}));

describe("Navigation", () => {
	it("renders navigation links with the correct text content", () => {
		render(
			<ThemeProvider defaultTheme="light" storageKey="test-theme">
				<MemoryRouter>
					<Navigation />
				</MemoryRouter>
			</ThemeProvider>,
		);

		expect(screen.getByText(NAVIGATION_LINK_TEXT_HOME)).toBeInTheDocument();
		expect(screen.getByText(NAVIGATION_LINK_TEXT_INGREDIENTS)).toBeInTheDocument();
		expect(screen.getByText(NAVIGATION_LINK_TEXT_RECIPES)).toBeInTheDocument();
	});

	it("renders a user menu", () => {
		render(
			<ThemeProvider defaultTheme="light" storageKey="test-theme">
				<MemoryRouter>
					<Navigation />
				</MemoryRouter>
			</ThemeProvider>,
		);

		expect(screen.getByTestId("user-menu")).toBeInTheDocument();
	});

	it("renders a theme toggle", () => {
		render(
			<ThemeProvider defaultTheme="light" storageKey="test-theme">
				<MemoryRouter>
					<Navigation />
				</MemoryRouter>
			</ThemeProvider>,
		);

		expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
	});
});
