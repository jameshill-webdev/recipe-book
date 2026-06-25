import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert/alert";
import { NOTIFICATION_ALERT_DEFAULT_LABEL } from "@/lib/content-strings";

interface AlertProps {
	titleText: string;
	bodyText?: string;
	ariaLabel?: string;
}

export function NotificationAlert({
	titleText,
	bodyText,
	ariaLabel = NOTIFICATION_ALERT_DEFAULT_LABEL,
}: AlertProps) {
	return (
		<div className="px-4 py-3" role="region" aria-label={ariaLabel}>
			<Alert tabIndex={-1} className="flex flex-row justify-between items-center">
				<div>
					<AlertTitle className="font-bold mb-1 text-[var(--color-success)]">
						{titleText}
					</AlertTitle>
					{bodyText && (
						<AlertDescription className="text-[var(--color-success)]">
							{bodyText}
						</AlertDescription>
					)}
				</div>
			</Alert>
		</div>
	);
}
