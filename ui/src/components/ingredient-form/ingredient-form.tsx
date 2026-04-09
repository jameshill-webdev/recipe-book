import { PURCHASE_UNITS } from "@recipe-book/shared/lib/purchase-units";
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

interface IngredientFormProps {
	label: string;
	isEdit?: boolean;
	onSubmit: (e: React.SubmitEvent) => void;
	name: string;
	setName: (value: string) => void;
	purchaseUnit: string;
	setPurchaseUnit: (value: string) => void;
	costPerUnit: string | number;
	setCostPerUnit: (value: string | number) => void;
	mutation: {
		isPending: boolean;
	};
	formError: string | null;
	setFormError: (value: string | null) => void;
}

export function IngredientForm({
	label,
	isEdit = false,
	onSubmit,
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
	return (
		<form
			onSubmit={onSubmit}
			className="mx-auto w-full flex flex-col gap-6 justify-start items-start md:grid md:grid-cols-[4fr_1fr_1fr_1fr] md:items-end"
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
					required
				/>
			</Field>
			<Field>
				<FieldLabel htmlFor="costPerUnit" className={isEdit ? "sr-only" : ""}>
					Cost per unit
				</FieldLabel>
				<Input
					id="costPerUnit"
					type="number"
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
					required
				/>
			</Field>
			<Field>
				<FieldLabel htmlFor="purchaseUnit" className={isEdit ? "sr-only" : ""}>
					Purchase unit
				</FieldLabel>
				<Select
					name="purchaseUnit"
					value={purchaseUnit}
					onValueChange={(value) => {
						setPurchaseUnit(value);
						setFormError(null);
					}}
					required
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
			</Field>
			<Field>
				<Button type="submit" disabled={mutation.isPending}>
					{mutation.isPending
						? isEdit
							? "Updating..."
							: "Creating..."
						: isEdit
							? "Update"
							: "Create"}
				</Button>
			</Field>
			{formError && <InlineError alert>{formError}</InlineError>}
		</form>
	);
}
