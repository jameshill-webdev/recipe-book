import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert/alert";
import { Button } from "@/components/ui/button/button";
import { useGlobalErrorStore } from "@/hooks/use-global-error-store";
import {
	GLOBAL_ERROR_ALERT_DISMISS_BUTTON_LABEL,
	GLOBAL_ERROR_ALERT_DISMISS_BUTTON_TEXT,
	GLOBAL_ERROR_ALERT_LABEL,
	GLOBAL_ERROR_ALERT_TITLE,
} from "@/lib/content-strings";

export function GlobalErrorAlert() {
	const { errorMessage, clearErrorMessage } = useGlobalErrorStore();

	if (!errorMessage) {
		return null;
	}

	return (
		<div className="px-4 py-3" role="region" aria-label={GLOBAL_ERROR_ALERT_LABEL}>
			<Alert
				variant="destructive"
				tabIndex={-1}
				className="flex flex-row justify-between items-center"
			>
				<div>
					<AlertTitle className="font-bold mb-1">{GLOBAL_ERROR_ALERT_TITLE}</AlertTitle>
					<AlertDescription className="text-[var(--color-destructive)]">
						<span>{errorMessage}</span>
					</AlertDescription>
				</div>
				<div>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={clearErrorMessage}
						aria-label={GLOBAL_ERROR_ALERT_DISMISS_BUTTON_LABEL}
					>
						{GLOBAL_ERROR_ALERT_DISMISS_BUTTON_TEXT}
					</Button>
				</div>
			</Alert>
		</div>
	);
}
