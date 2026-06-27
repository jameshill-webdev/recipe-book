import { Field, FieldLabel, FieldGroup } from "@/components/ui/field/field";
import { Input } from "@/components/ui/input/input";
import type { RecipeFormIngredient } from "@recipe-book/shared/types/recipe";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select/select";
import {
	Autocomplete,
	AutocompleteInput,
	AutocompletePositioner,
	AutocompletePopup,
	AutocompleteList,
	AutocompleteItem,
} from "@/components/ui/autocomplete/autocomplete";
import { PURCHASE_UNITS } from "@recipe-book/shared/lib/units";
import type { Ingredient } from "@recipe-book/shared/types/ingredient";
import {
	RECIPE_INGREDIENT_DELETE_LABEL,
	RECIPE_INGREDIENT_NAME_LABEL,
	RECIPE_INGREDIENT_QUANTITY_LABEL,
	RECIPE_INGREDIENT_UNIT_LABEL,
	RECIPE_INGREDIENT_UNTITLED_LABEL,
} from "@/lib/content-strings";
import { Button } from "../ui/button/button";
import { X } from "lucide-react";

interface RecipeFormIngredientProps {
	ingredient: RecipeFormIngredient;
	index: number;
	ingredients: RecipeFormIngredient[];
	setIngredients: (value: RecipeFormIngredient[]) => void;
	ingredientOptions: Ingredient[];
	setFormError: (value: string | null) => void;
	onDelete: () => void;
}

export function RecipeFormIngredientItem({
	ingredient,
	index,
	ingredients,
	setIngredients,
	ingredientOptions,
	setFormError,
	onDelete,
}: RecipeFormIngredientProps) {
	return (
		<li
			key={ingredient.userInterfaceId}
			id={ingredient.userInterfaceId}
			aria-label={ingredient.name || `${RECIPE_INGREDIENT_UNTITLED_LABEL} ${index + 1}`}
			className="mb-2"
		>
			<FieldGroup className="grid gap-2 grid-cols-[6fr_2fr_3fr_1fr]">
				<Field>
					<FieldLabel
						htmlFor={`ingredient-${ingredient.userInterfaceId}-name`}
						className="sr-only"
					>
						{RECIPE_INGREDIENT_NAME_LABEL}
					</FieldLabel>
					<Autocomplete
						id={`ingredient-${ingredient.userInterfaceId}-name`}
						items={ingredientOptions.map((option) => option.name)}
						onValueChange={(value) => {
							const updatedIngredients = [...ingredients];
							const thisIngredient = updatedIngredients.find(
								(item) => item.userInterfaceId === ingredient.userInterfaceId,
							);

							if (thisIngredient) {
								thisIngredient.name = value;
							}

							setIngredients(updatedIngredients);
							setFormError(null);
						}}
						value={ingredient.name}
					>
						<AutocompleteInput data-testid="ingredient-name-autocomplete" />
						<AutocompletePositioner sideOffset={4}>
							<AutocompletePopup>
								<AutocompleteList>
									{(item: string) => (
										<AutocompleteItem key={item} value={item}>
											{item}
										</AutocompleteItem>
									)}
								</AutocompleteList>
							</AutocompletePopup>
						</AutocompletePositioner>
					</Autocomplete>
				</Field>
				<Field>
					<FieldLabel
						htmlFor={`ingredient-${ingredient.userInterfaceId}-quantity`}
						className="sr-only"
					>
						{RECIPE_INGREDIENT_QUANTITY_LABEL}
					</FieldLabel>
					<Input
						id={`ingredient-${ingredient.userInterfaceId}-quantity`}
						type="text"
						autoComplete="off"
						inputMode="numeric"
						value={ingredient.quantity}
						onChange={(e) => {
							const updatedIngredients = [...ingredients];
							const thisIngredient = updatedIngredients.find(
								(item) => item.userInterfaceId === ingredient.userInterfaceId,
							);

							if (thisIngredient) {
								thisIngredient.quantity = parseFloat(e.target.value || "0");
							}

							setIngredients(updatedIngredients);
							setFormError(null);
						}}
						placeholder={RECIPE_INGREDIENT_QUANTITY_LABEL}
					/>
				</Field>
				<Field>
					<FieldLabel
						htmlFor={`ingredient-${ingredient.userInterfaceId}-unit`}
						className="sr-only"
					>
						{RECIPE_INGREDIENT_UNIT_LABEL}
					</FieldLabel>
					<Select
						name={`ingredient-${ingredient.userInterfaceId}-unit`}
						value={ingredient.unit}
						onValueChange={(value) => {
							const updatedIngredients = [...ingredients];
							const thisIngredient = updatedIngredients.find(
								(item) => item.userInterfaceId === ingredient.userInterfaceId,
							);

							if (thisIngredient) {
								thisIngredient.unit = value as (typeof PURCHASE_UNITS)[number];
							}

							setIngredients(updatedIngredients);
							setFormError(null);
						}}
					>
						<SelectTrigger
							id={`ingredient-${ingredient.userInterfaceId}-unit`}
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
				<Field>
					<Button type="button" variant="outline" onClick={() => onDelete()}>
						<X />
						<span className="sr-only">{RECIPE_INGREDIENT_DELETE_LABEL}</span>
					</Button>
				</Field>
			</FieldGroup>
		</li>
	);
}
