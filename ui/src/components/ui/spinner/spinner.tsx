import { Loader2Icon } from "lucide-react";

import { cn } from "@/lib/utils";
import { LOADING_SPINNER_ARIA_LABEL } from "@/lib/content-strings";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
	return (
		<Loader2Icon
			role="status"
			aria-label={LOADING_SPINNER_ARIA_LABEL}
			className={cn("size-4 animate-spin", className)}
			{...props}
		/>
	);
}

export { Spinner };
