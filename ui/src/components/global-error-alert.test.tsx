import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GlobalErrorAlert } from "@/components/global-error-alert";
import { Button } from "@/components/ui/button";
import { useGlobalErrorStore } from "@/hooks/use-global-error-store";
import { GlobalErrorProvider } from "@/providers/global-error-provider";
import {
	GLOBAL_ERROR_ALERT_DISMISS_BUTTON_LABEL,
	GLOBAL_ERROR_ALERT_TITLE,
} from "@/lib/content-strings";

const TEST_ERROR_MESSAGE = "Global test error message";
const SET_ERROR_BUTTON_LABEL = "Set error";

function BannerHarness() {
	const { setErrorMessage } = useGlobalErrorStore();

	return (
		<>
			<Button type="button" onClick={() => setErrorMessage(TEST_ERROR_MESSAGE)}>
				{SET_ERROR_BUTTON_LABEL}
			</Button>
			<GlobalErrorAlert />
		</>
	);
}

function renderBannerHarness() {
	return render(
		<GlobalErrorProvider>
			<BannerHarness />
		</GlobalErrorProvider>,
	);
}

describe("GlobalErrorAlert", () => {
	it("does not render when no global error is set", () => {
		renderBannerHarness();

		expect(screen.queryByText(TEST_ERROR_MESSAGE)).not.toBeInTheDocument();
		expect(screen.queryByText(GLOBAL_ERROR_ALERT_TITLE)).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: GLOBAL_ERROR_ALERT_DISMISS_BUTTON_LABEL }),
		).not.toBeInTheDocument();
	});

	it("renders when a global error is set", () => {
		renderBannerHarness();

		expect(screen.queryByText(TEST_ERROR_MESSAGE)).not.toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: SET_ERROR_BUTTON_LABEL }));

		expect(screen.getByText(TEST_ERROR_MESSAGE)).toBeInTheDocument();
		expect(screen.getByText(GLOBAL_ERROR_ALERT_TITLE)).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: GLOBAL_ERROR_ALERT_DISMISS_BUTTON_LABEL }),
		).toBeInTheDocument();
	});

	it("hides after dismiss is clicked", () => {
		renderBannerHarness();

		fireEvent.click(screen.getByRole("button", { name: SET_ERROR_BUTTON_LABEL }));
		expect(screen.getByText(TEST_ERROR_MESSAGE)).toBeInTheDocument();

		fireEvent.click(
			screen.getByRole("button", { name: GLOBAL_ERROR_ALERT_DISMISS_BUTTON_LABEL }),
		);

		expect(screen.queryByText(TEST_ERROR_MESSAGE)).not.toBeInTheDocument();
		expect(screen.queryByText(GLOBAL_ERROR_ALERT_TITLE)).not.toBeInTheDocument();
	});
});
