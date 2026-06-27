import { Button } from "@/components/ui/button/button";
import { InlineError } from "@/components/ui/error/error";
import { Field, FieldLabel, FieldSet, FieldLegend, FieldGroup } from "@/components/ui/field/field";
import { Input } from "@/components/ui/input/input";
import { Textarea } from "@/components/ui/textarea/textarea";
import { useState } from "react";
import z from "zod";
import { mapIssuesToFieldErrors } from "@/lib/validation/errors";
import {
	recipeCookTimeSchema,
	recipeFormIngredientsSchema,
	recipeMethodSchema,
	recipeNameSchema,
	recipeNumberOfPortionsSchema,
	recipePrepTimeSchema,
	recipeShelfLifeSchema,
} from "@/lib/validation/fields";
import type { RecipeFormIngredient, Duration } from "@recipe-book/shared/types/recipe";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select/select";
import type { Ingredient } from "@recipe-book/shared/types/ingredient";
import { PURCHASE_UNITS, TIME_UNITS } from "@recipe-book/shared/lib/units";
import { getErrorMessage } from "@/lib/utils";
import { RecipeFormIngredientItem } from "../recipe-ingredient/recipe-ingredient";
import { LoadingSpinner } from "../loading-spinner/loading-spinner";
import {
	INGREDIENTS_LIST_NO_RESULTS,
	RECIPE_FORM_ADD_INGREDIENT_BUTTON_LABEL,
	RECIPE_FORM_COOK_TIME_LABEL,
	RECIPE_FORM_COOK_TIME_UNIT_LABEL,
	RECIPE_FORM_COOK_TIME_UNIT_PLACEHOLDER,
	RECIPE_FORM_COOK_TIME_VALUE_LABEL,
	RECIPE_FORM_CREATE_BUTTON_LABEL,
	RECIPE_FORM_CREATING_BUTTON_LABEL,
	RECIPE_FORM_INGREDIENTS_LABEL,
	RECIPE_FORM_METHOD_LABEL,
	RECIPE_FORM_METHOD_PLACEHOLDER,
	RECIPE_FORM_NAME_LABEL,
	RECIPE_FORM_NAME_PLACEHOLDER,
	RECIPE_FORM_PORTIONS_LABEL,
	RECIPE_FORM_PREP_TIME_LABEL,
	RECIPE_FORM_PREP_TIME_UNIT_LABEL,
	RECIPE_FORM_PREP_TIME_UNIT_PLACEHOLDER,
	RECIPE_FORM_PREP_TIME_VALUE_LABEL,
	RECIPE_FORM_SHELF_LIFE_LABEL,
	RECIPE_FORM_SHELF_LIFE_UNIT_LABEL,
	RECIPE_FORM_SHELF_LIFE_UNIT_PLACEHOLDER,
	RECIPE_FORM_SHELF_LIFE_VALUE_LABEL,
	RECIPE_FORM_UPDATE_BUTTON_LABEL,
	RECIPE_FORM_UPDATING_BUTTON_LABEL,
} from "@/lib/content-strings";

interface RecipeFormProps {
	label: string;
	isEdit?: boolean;
	submitHandler: (e: React.SubmitEvent) => void;
	name: string;
	setName: (value: string) => void;
	ingredientOptions: Ingredient[];
	isIngredientsPending: boolean;
	ingredientsError: Error | null;
	ingredients: RecipeFormIngredient[];
	setIngredients: (value: RecipeFormIngredient[]) => void;
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
	mutation: {
		isPending: boolean;
	};
	formError: string | null;
	setFormError: (value: string | null) => void;
}

const recipeSchema = z.object({
	name: recipeNameSchema,
	method: recipeMethodSchema,
	ingredients: recipeFormIngredientsSchema,
	prepTime: recipePrepTimeSchema,
	cookTime: recipeCookTimeSchema,
	shelfLife: recipeShelfLifeSchema,
	numberOfPortions: recipeNumberOfPortionsSchema,
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
	method,
	setMethod,
	prepTime,
	setPrepTime,
	cookTime,
	setCookTime,
	shelfLife,
	setShelfLife,
	numberOfPortions,
	setNumberOfPortions,
	mutation,
	formError,
	setFormError,
}: RecipeFormProps) {
	const [fieldErrors, setFieldErrors] = useState<RecipeFieldErrors>({});

	function onSubmit(event: React.SubmitEvent) {
		event.preventDefault();

		const parsedRecipeData = recipeSchema.safeParse({
			name,
			method,
			ingredients,
			prepTime,
			cookTime,
			shelfLife,
			numberOfPortions,
		});

		if (!parsedRecipeData.success) {
			console.log(parsedRecipeData.error.issues);
			setFieldErrors(mapIssuesToFieldErrors<RecipeField>(parsedRecipeData.error.issues));
			return;
		}

		submitHandler(event);
	}

	return (
		<form
			onSubmit={onSubmit}
			className={`w-full mx-auto grid grid-rows-1 gap-6 max-w-lg`}
			aria-label={label}
		>
			<Field>
				<FieldLabel htmlFor="name">{RECIPE_FORM_NAME_LABEL}</FieldLabel>
				<Input
					id="name"
					type="text"
					autoComplete="off"
					value={name}
					onChange={(e) => {
						setFormError(null);
						setName(e.target.value);
					}}
					placeholder={RECIPE_FORM_NAME_PLACEHOLDER}
				/>
				{fieldErrors.name && <InlineError alert>{fieldErrors.name}</InlineError>}
			</Field>
			<FieldSet className="gap-2">
				<FieldLegend>{RECIPE_FORM_INGREDIENTS_LABEL}</FieldLegend>
				{isIngredientsPending ? (
					<LoadingSpinner />
				) : ingredientsError ? (
					<InlineError alert data-ingredients-error={ingredientsError}>
						{getErrorMessage(ingredientsError)}
					</InlineError>
				) : ingredients.length === 0 ? (
					<p className="text-center text-[var(--color-muted-foreground)]">
						{INGREDIENTS_LIST_NO_RESULTS}
					</p>
				) : (
					<ul className="list-none p-0">
						{ingredients.map((ingredient, index) => (
							<RecipeFormIngredientItem
								key={`${ingredient.userInterfaceId}`}
								ingredient={ingredient}
								index={index}
								ingredients={ingredients}
								setIngredients={setIngredients}
								ingredientOptions={ingredientOptions}
								setFormError={setFormError}
								onDelete={() => {
									setIngredients(
										ingredients.filter(
											(_ingredient) =>
												_ingredient.userInterfaceId !==
												ingredient.userInterfaceId,
										),
									);
								}}
							/>
						))}
					</ul>
				)}
				{fieldErrors.ingredients && (
					<InlineError alert>{fieldErrors.ingredients}</InlineError>
				)}
				<Button
					type="button"
					className="mt-2"
					onClick={() => {
						setFormError(null);
						setIngredients([
							...ingredients,
							{
								ingredientId: "",
								name: "",
								quantity: 1,
								unit: PURCHASE_UNITS[0],
								userInterfaceId: crypto.randomUUID(),
							},
						]);
					}}
				>
					{RECIPE_FORM_ADD_INGREDIENT_BUTTON_LABEL}
				</Button>
			</FieldSet>
			<Field>
				<FieldLabel htmlFor="method">{RECIPE_FORM_METHOD_LABEL}</FieldLabel>
				<Textarea
					id="method"
					autoComplete="off"
					value={method}
					onChange={(e) => {
						setFormError(null);
						setMethod(e.target.value);
					}}
					placeholder={RECIPE_FORM_METHOD_PLACEHOLDER}
				/>
				{fieldErrors.method && <InlineError alert>{fieldErrors.method}</InlineError>}
			</Field>
			<div className="grid gap-6 grid-cols-[1fr_1fr]">
				<FieldSet>
					<FieldLegend>{RECIPE_FORM_PREP_TIME_LABEL}</FieldLegend>
					<FieldGroup className="grid gap-2 grid-cols-[1fr_1fr]">
						<Field>
							<FieldLabel className="sr-only" htmlFor="prepTime">
								{RECIPE_FORM_PREP_TIME_VALUE_LABEL}
							</FieldLabel>
							<Input
								id="prepTime"
								type="text"
								autoComplete="off"
								inputMode="numeric"
								value={prepTime.time.toString()}
								onChange={(e) => {
									setFormError(null);
									setPrepTime({
										...prepTime,
										time: parseInt(e.target.value || "0", 10),
									});
								}}
								placeholder={RECIPE_FORM_PREP_TIME_VALUE_LABEL}
							/>
						</Field>
						<Field>
							<FieldLabel className="sr-only" htmlFor={`prepTimeUnit`}>
								{RECIPE_FORM_PREP_TIME_UNIT_LABEL}
							</FieldLabel>
							<Select
								name={`prepTimeUnit`}
								defaultValue={prepTime.unit}
								value={prepTime.unit}
								onValueChange={(value) => {
									setFormError(null);
									setPrepTime({
										...prepTime,
										unit: value as (typeof TIME_UNITS)[number],
									});
								}}
							>
								<SelectTrigger id={`prepTimeUnit`} className="w-full">
									<SelectValue
										placeholder={RECIPE_FORM_PREP_TIME_UNIT_PLACEHOLDER}
									/>
								</SelectTrigger>
								<SelectContent>
									{TIME_UNITS.map((unit) => (
										<SelectItem key={unit} value={unit}>
											{unit.toLocaleLowerCase()}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>
						{fieldErrors.prepTime && (
							<InlineError alert>{fieldErrors.prepTime}</InlineError>
						)}
					</FieldGroup>
				</FieldSet>
				<FieldSet>
					<FieldLegend>{RECIPE_FORM_COOK_TIME_LABEL}</FieldLegend>
					<FieldGroup className="grid gap-2 grid-cols-[1fr_1fr]">
						<Field>
							<FieldLabel className="sr-only" htmlFor="cookTime">
								{RECIPE_FORM_COOK_TIME_VALUE_LABEL}
							</FieldLabel>
							<Input
								id="cookTime"
								type="text"
								autoComplete="off"
								inputMode="numeric"
								value={cookTime.time.toString()}
								onChange={(e) => {
									setFormError(null);
									setCookTime({
										...cookTime,
										time: parseInt(e.target.value || "0", 10),
									});
								}}
								placeholder={RECIPE_FORM_COOK_TIME_VALUE_LABEL}
							/>
						</Field>
						<Field>
							<FieldLabel className="sr-only" htmlFor={`cookTimeUnit`}>
								{RECIPE_FORM_COOK_TIME_UNIT_LABEL}
							</FieldLabel>
							<Select
								name={`cookTimeUnit`}
								defaultValue={cookTime.unit}
								value={cookTime.unit}
								onValueChange={(value) => {
									setFormError(null);
									setCookTime({
										...cookTime,
										unit: value as (typeof TIME_UNITS)[number],
									});
								}}
							>
								<SelectTrigger id={`cookTimeUnit`} className="w-full">
									<SelectValue
										placeholder={RECIPE_FORM_COOK_TIME_UNIT_PLACEHOLDER}
									/>
								</SelectTrigger>
								<SelectContent>
									{TIME_UNITS.map((unit) => (
										<SelectItem key={unit} value={unit}>
											{unit.toLocaleLowerCase()}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>
						{fieldErrors.cookTime && (
							<InlineError alert>{fieldErrors.cookTime}</InlineError>
						)}
					</FieldGroup>
				</FieldSet>
			</div>
			<div className="grid gap-6 grid-cols-[1fr_1fr]">
				<FieldSet>
					<FieldLegend>{RECIPE_FORM_SHELF_LIFE_LABEL}</FieldLegend>
					<FieldGroup className="grid gap-2 grid-cols-[1fr_1fr]">
						<Field>
							<FieldLabel className="sr-only" htmlFor="shelfLife">
								{RECIPE_FORM_SHELF_LIFE_VALUE_LABEL}
							</FieldLabel>
							<Input
								id="shelfLife"
								type="text"
								autoComplete="off"
								inputMode="numeric"
								value={shelfLife.time.toString()}
								onChange={(e) => {
									setShelfLife({
										...shelfLife,
										time: parseInt(e.target.value || "0", 10),
									});
									setFormError(null);
								}}
								placeholder={RECIPE_FORM_SHELF_LIFE_VALUE_LABEL}
							/>
						</Field>
						<Field>
							<FieldLabel className="sr-only" htmlFor={`shelfLifeUnit`}>
								{RECIPE_FORM_SHELF_LIFE_UNIT_LABEL}
							</FieldLabel>
							<Select
								name={`shelfLifeUnit`}
								defaultValue={shelfLife.unit}
								value={shelfLife.unit}
								onValueChange={(value) => {
									setShelfLife({
										...shelfLife,
										unit: value as (typeof TIME_UNITS)[number],
									});
									setFormError(null);
								}}
							>
								<SelectTrigger id={`shelfLifeUnit`} className="w-full">
									<SelectValue
										placeholder={RECIPE_FORM_SHELF_LIFE_UNIT_PLACEHOLDER}
									/>
								</SelectTrigger>
								<SelectContent>
									{TIME_UNITS.map((unit) => (
										<SelectItem key={unit} value={unit}>
											{unit.toLocaleLowerCase()}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>
						{fieldErrors.shelfLife && (
							<InlineError alert>{fieldErrors.shelfLife}</InlineError>
						)}
					</FieldGroup>
				</FieldSet>
				<Field>
					<FieldLabel htmlFor="numberOfPortions">{RECIPE_FORM_PORTIONS_LABEL}</FieldLabel>
					<Input
						className="max-w-[6rem]"
						id="numberOfPortions"
						type="text"
						autoComplete="off"
						inputMode="numeric"
						value={numberOfPortions.toString()}
						onChange={(e) => {
							setNumberOfPortions(parseInt(e.target.value || "0", 10));
							setFormError(null);
						}}
						placeholder={RECIPE_FORM_PORTIONS_LABEL}
					/>
					{fieldErrors.numberOfPortions && (
						<InlineError alert>{fieldErrors.numberOfPortions}</InlineError>
					)}
				</Field>
			</div>
			<Field>
				<Button
					type="submit"
					disabled={mutation.isPending}
					className={`block ${isEdit ? "" : "md:mt-6"}`}
				>
					{isEdit
						? mutation.isPending
							? RECIPE_FORM_UPDATING_BUTTON_LABEL
							: RECIPE_FORM_UPDATE_BUTTON_LABEL
						: mutation.isPending
							? RECIPE_FORM_CREATING_BUTTON_LABEL
							: RECIPE_FORM_CREATE_BUTTON_LABEL}
				</Button>
			</Field>
			{formError && <InlineError alert>{formError}</InlineError>}
		</form>
	);
}
