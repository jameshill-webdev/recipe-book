import { Button } from "@/components/ui/button/button";
import { InlineError } from "@/components/ui/error/error";
import { Field, FieldLabel, FieldSet, FieldLegend, FieldGroup } from "@/components/ui/field/field";
import { Input } from "@/components/ui/input/input";
import { useState } from "react";
import z from "zod";
import { mapIssuesToFieldErrors } from "@/lib/validation/errors";
import { recipeNameSchema } from "@/lib/validation/fields";
import { Check } from "lucide-react";
import type { Duration, RecipeIngredient } from "@/lib/types/recipe";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select/select";
import type { Ingredient } from "@/lib/types/ingredient";
import { PURCHASE_UNITS } from "@recipe-book/shared/lib/purchase-units";
import { getErrorMessage } from "@/lib/utils";

interface RecipeFormProps {
	label: string;
	isEdit?: boolean;
	submitHandler: (e: React.SubmitEvent) => void;
	name: string;
	setName: (value: string) => void;
	ingredientOptions: Ingredient[];
	isIngredientsPending: boolean;
	ingredientsError: Error | null;
	ingredients: RecipeIngredient[];
	setIngredients: (value: RecipeIngredient[]) => void;
	method: string;
	setMethod: (value: string) => void;
	prepTime: Duration;
	setPrepTime: (value: Duration) => void;
	cookTime: Duration;
	setCookTime: (value: Duration) => void;
	shelfLife: Duration;
	setShelfLife: (value: Duration) => void;
	numberOfPortions: number;
	setNumberOfPortions: (value: number) => void;
	costPerPortion: number;
	setCostPerPortion: (value: number) => void;
	mutation: {
		isPending: boolean;
	};
	formError: string | null;
	setFormError: (value: string | null) => void;
}

const recipeSchema = z.object({
	name: recipeNameSchema,
});

type RecipeFormValues = z.infer<typeof recipeSchema>;
type RecipeField = keyof RecipeFormValues;
type RecipeFieldErrors = Partial<Record<RecipeField, string>>;

export function RecipeForm({
	label,
	isEdit = false,
	submitHandler,
	name,
	setName,
	ingredientOptions,
	isIngredientsPending,
	ingredientsError,
	ingredients,
	setIngredients,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	method,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	setMethod,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	prepTime,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	setPrepTime,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	cookTime,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	setCookTime,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	shelfLife,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	setShelfLife,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	numberOfPortions,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	setNumberOfPortions,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	costPerPortion,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	setCostPerPortion,
	mutation,
	formError,
	setFormError,
}: RecipeFormProps) {
	const [fieldErrors, setFieldErrors] = useState<RecipeFieldErrors>({});

	function onSubmit(event: React.SubmitEvent) {
		event.preventDefault();

		const parsedRecipeData = recipeSchema.safeParse({
			name,
		});

		if (!parsedRecipeData.success) {
			setFieldErrors(mapIssuesToFieldErrors<RecipeField>(parsedRecipeData.error.issues));
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
			<FieldSet>
				<FieldLegend>Ingredients</FieldLegend>
				{isIngredientsPending ? (
					<p>Loading ingredients...</p>
				) : ingredientsError ? (
					<InlineError alert>{getErrorMessage(ingredientsError)}</InlineError>
				) : ingredients.length === 0 ? (
					<p>No ingredients added</p>
				) : (
					<>
						{ingredients.map((ingredient, index) => (
							// TODO: extract to separate component if feasible
							<FieldGroup key={`${ingredient.ingredientId}-${index}`}>
								<Field>
									<FieldLabel
										htmlFor={`ingredients[${index}][ingredientId]`}
										className="sr-only"
									>
										Ingredient
									</FieldLabel>
									<Select
										name={`ingredients[${index}][ingredientId]`}
										value={ingredient.ingredientId}
										onValueChange={(value) => {
											const updatedIngredients = [...ingredients];

											updatedIngredients[index].ingredientId = value;
											updatedIngredients[index].name =
												ingredientOptions.find(
													(option) => option.id === value,
												)?.name || "";
											updatedIngredients[index].quantity = 1;
											updatedIngredients[index].unit = PURCHASE_UNITS[0];

											setIngredients(updatedIngredients);
											setFormError(null);
										}}
									>
										<SelectTrigger
											id={`ingredients[${index}][ingredientId]`}
											className="w-full"
										>
											<SelectValue placeholder="Select an ingredient" />
										</SelectTrigger>
										<SelectContent>
											{ingredientOptions.map((ingredientOption) => (
												<SelectItem
													key={ingredientOption.id}
													value={ingredientOption.id}
												>
													{ingredientOption.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</Field>
								<Field>
									<FieldLabel
										htmlFor={`ingredients[${index}][quantity]`}
										className="sr-only"
									>
										Quantity
									</FieldLabel>
									<Input
										id={`ingredients[${index}][quantity]`}
										type="number"
										autoComplete="off"
										inputMode="decimal"
										min="0"
										step="0.01"
										value={ingredient.quantity}
										onChange={(e) => {
											const updatedIngredients = [...ingredients];
											updatedIngredients[index].quantity = parseFloat(
												e.target.value,
											);
											setIngredients(updatedIngredients);
											setFormError(null);
										}}
										placeholder="Quantity"
									/>
								</Field>
								<Field>
									<FieldLabel
										htmlFor={`ingredients[${index}][unit]`}
										className="sr-only"
									>
										Unit
									</FieldLabel>
									<Select
										name={`ingredients[${index}][unit]`}
										value={ingredient.unit}
										onValueChange={(value) => {
											const updatedIngredients = [...ingredients];
											updatedIngredients[index].unit =
												value as (typeof PURCHASE_UNITS)[number];
											setIngredients(updatedIngredients);
											setFormError(null);
										}}
									>
										<SelectTrigger
											id={`ingredients[${index}][unit]`}
											className="w-full"
										>
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
							</FieldGroup>
						))}
					</>
				)}

				<Button
					type="button"
					onClick={() =>
						setIngredients([
							...ingredients,
							{
								ingredientId: ingredientOptions[0]?.id || "",
								name: ingredientOptions[0]?.name || "",
								quantity: 1,
								unit: PURCHASE_UNITS[0],
							},
						])
					}
				>
					Add ingredient
				</Button>
			</FieldSet>
			{/* TODO: fields for remaining recipe details */}
			<Field>
				<Button
					type="submit"
					disabled={mutation.isPending}
					className={`block ${isEdit ? "" : "md:mt-6"}`}
					aria-label={
						isEdit
							? mutation.isPending
								? "Updating recipe"
								: "Update recipe"
							: mutation.isPending
								? "Creating recipe"
								: "Create recipe"
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
