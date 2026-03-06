import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const PLACEHOLDER_ERROR = "Something went wrong. Please try again.";

export function GlobalAlertBanner() {
	const [dismissed, setDismissed] = useState(false);
	const globalError = PLACEHOLDER_ERROR;

	if (!globalError || dismissed) {
		return null;
	}

	return (
		<div className="px-4 py-3" role="region" aria-label="Global alerts">
			<Alert
				variant="destructive"
				tabIndex={-1}
				className="flex flex-row justify-between items-center"
			>
				<div>
					<AlertTitle className="font-bold mb-1">There was a problem</AlertTitle>
					<AlertDescription className="text-[var(--color-destructive)]">
						<span>{globalError}</span>
					</AlertDescription>
				</div>
				<div>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => setDismissed(true)}
						aria-label="Dismiss global error"
					>
						Dismiss
					</Button>
				</div>
			</Alert>
		</div>
	);
}
