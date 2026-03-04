import * as React from "react";

import { cn } from "@/lib/utils";

type InlineErrorProps = React.ComponentProps<"p"> & {
	alert?: boolean;
};

function InlineError({
	className,
	alert = false,
	role,
	"aria-live": ariaLive,
	...props
}: InlineErrorProps) {
	return (
		<p
			data-slot="inline-error"
			className={cn("text-destructive text-sm", className)}
			role={alert ? "alert" : role}
			aria-live={alert ? ariaLive : (ariaLive ?? "polite")}
			{...props}
		/>
	);
}

export { InlineError };
