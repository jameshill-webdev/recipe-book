import * as React from "react";

import { cn } from "@/lib/utils";

function Field({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="field"
			className={cn("grid gap-2 mx-auto w-full max-w-lg", className)}
			{...props}
		/>
	);
}

function FieldLabel({ className, ...props }: React.ComponentProps<"label">) {
	return (
		<label
			data-slot="field-label"
			className={cn("text-sm leading-none font-medium mb-1", className)}
			{...props}
		/>
	);
}

export { Field, FieldLabel };
