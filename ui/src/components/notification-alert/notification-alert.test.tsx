import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { NotificationAlert } from "./notification-alert";
import { NOTIFICATION_ALERT_DEFAULT_LABEL } from "@/lib/content-strings";

const TEST_DATA = {
	titleText: "test title text",
	bodyText: "test body text",
	ariaLabel: "test aria label",
};

describe("NotificationAlert", () => {
	it("renders the notification alert with provided title text, no description, and default label", () => {
		render(<NotificationAlert titleText={TEST_DATA.titleText} />);

		const alert = screen.getByRole("region", { name: NOTIFICATION_ALERT_DEFAULT_LABEL });

		expect(within(alert).getByRole("heading")).toHaveTextContent(TEST_DATA.titleText);
		expect(within(alert).queryByRole("paragraph")).not.toBeInTheDocument();
	});

	it("renders the notification alert with provided title text, description, and label", () => {
		render(
			<NotificationAlert
				titleText={TEST_DATA.titleText}
				bodyText={TEST_DATA.bodyText}
				ariaLabel={TEST_DATA.ariaLabel}
			/>,
		);

		const alert = screen.getByRole("region", { name: TEST_DATA.ariaLabel });

		expect(within(alert).getByRole("heading")).toHaveTextContent(TEST_DATA.titleText);
		expect(within(alert).queryByRole("paragraph")).toHaveTextContent(TEST_DATA.bodyText);
	});
});
