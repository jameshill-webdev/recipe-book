import { PURCHASE_UNITS, type PurchaseUnit } from "@recipe-book/shared/lib/units";
import { Button } from "@/components/ui/button/button";
import { InlineError } from "@/components/ui/error/error";
import { Field, FieldLabel } from "@/components/ui/field/field";
import { Input } from "@/components/ui/input/input";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select/select";
import { useState } from "react";
import z from "zod";
import { mapIssuesToFieldErrors } from "@/lib/validation/errors";
import {
	ingredientCostPerUnitSchema,
	ingredientNameSchema,
	ingredientPurchaseUnitSchema,
} from "@/lib/validation/fields";
import { Check } from "lucide-react";

interface IngredientFormProps {
	label: string;
	isEdit?: boolean;
	submitHandler: (e: React.SubmitEvent) => void;
	name: string;
	setName: (value: string) => void;
	purchaseUnit: PurchaseUnit;
	setPurchaseUnit: (value: PurchaseUnit) => void;
	costPerUnit: string;
	setCostPerUnit: (value: string) => void;
	mutation: {
		isPending: boolean;
	};
	formError: string | null;
	setFormError: (value: string | null) => void;
}

const ingredientSchema = z.object({
	name: ingredientNameSchema,
	costPerUnit: ingredientCostPerUnitSchema,
	purchaseUnit: ingredientPurchaseUnitSchema,
});

type IngredientFormValues = z.infer<typeof ingredientSchema>;
type IngredientField = keyof IngredientFormValues;
type IngredientFieldErrors = Partial<Record<IngredientField, string>>;

export function IngredientForm({
	label,
	isEdit = false,
	submitHandler,
	name,
	setName,
	purchaseUnit,
	setPurchaseUnit,
	costPerUnit,
	setCostPerUnit,
	mutation,
	formError,
	setFormError,
}: IngredientFormProps) {
	const [fieldErrors, setFieldErrors] = useState<IngredientFieldErrors>({});

	function onSubmit(event: React.SubmitEvent) {
		event.preventDefault();

		const parsedIngredientData = ingredientSchema.safeParse({
			name,
			costPerUnit,
			purchaseUnit,
		});

		if (!parsedIngredientData.success) {
			setFieldErrors(
				mapIssuesToFieldErrors<IngredientField>(parsedIngredientData.error.issues),
			);
			return;
		}

		submitHandler(event);
	}

	return (
		<form
			onSubmit={onSubmit}
			className={`w-full mx-auto grid ${isEdit ? "gap-2 grid-cols-[4fr_2fr_2fr_0.5fr] md:grid-cols-[6fr_2fr_2fr_0.5fr] items-start" : "grid-rows-1 gap-6 max-w-lg"}`}
			aria-label={label}
		>
			<Field>
				<FieldLabel htmlFor="name" className={isEdit ? "sr-only" : ""}>
					Name
				</FieldLabel>
				<Input
					id="name"
					type="text"
					autoComplete="off"
					value={name}
					onChange={(e) => {
						setName(e.target.value);
						setFormError(null);
					}}
					placeholder="Name"
				/>
				{fieldErrors.name && <InlineError alert>{fieldErrors.name}</InlineError>}
			</Field>
			<Field>
				<FieldLabel htmlFor="costPerUnit" className={isEdit ? "sr-only" : ""}>
					Cost per unit
				</FieldLabel>
				<Input
					id="costPerUnit"
					type="text"
					autoComplete="off"
					inputMode="decimal"
					min="0"
					step="0.01"
					value={costPerUnit}
					onChange={(e) => {
						setCostPerUnit(e.target.value);
						setFormError(null);
					}}
					placeholder="Cost per unit"
				/>
				{fieldErrors.costPerUnit && (
					<InlineError alert>{fieldErrors.costPerUnit}</InlineError>
				)}
			</Field>
			<Field>
				<FieldLabel htmlFor="purchaseUnit" className={isEdit ? "sr-only" : ""}>
					Purchase unit
				</FieldLabel>
				<Select
					name="purchaseUnit"
					value={purchaseUnit}
					onValueChange={(value) => {
						setPurchaseUnit(value as PurchaseUnit);
						setFormError(null);
					}}
				>
					<SelectTrigger id="purchaseUnit" className="w-full">
						<SelectValue placeholder="Select a unit" />
					</SelectTrigger>
					<SelectContent>
						{PURCHASE_UNITS.map((unit) => (
							<SelectItem key={unit} value={unit}>
								{unit.toLocaleLowerCase()}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{fieldErrors.purchaseUnit && (
					<InlineError alert>{fieldErrors.purchaseUnit}</InlineError>
				)}
			</Field>
			<Field>
				<Button
					type="submit"
					disabled={mutation.isPending}
					className={`block ${isEdit ? "" : "md:mt-6"}`}
					aria-label={
						isEdit
							? mutation.isPending
								? "Updating ingredient"
								: "Update ingredient"
							: mutation.isPending
								? "Creating ingredient"
								: "Create ingredient"
					}
				>
					{mutation.isPending ? (
						isEdit ? (
							<Check />
						) : (
							"Creating..."
						)
					) : isEdit ? (
						<Check />
					) : (
						"Create"
					)}
				</Button>
			</Field>
			{formError && <InlineError alert>{formError}</InlineError>}
		</form>
	);
}
