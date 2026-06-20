import { Field, FieldLabel, FieldGroup } from "@/components/ui/field/field";
import { Input } from "@/components/ui/input/input";
import type { CreateRecipeIngredientPayload } from "@recipe-book/shared/types/recipe";
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
} from "@/lib/content-strings";
import { Button } from "../ui/button/button";
import { X } from "lucide-react";

interface RecipeFormIngredientProps {
	ingredient: CreateRecipeIngredientPayload;
	index: number;
	ingredients: CreateRecipeIngredientPayload[];
	setIngredients: (value: CreateRecipeIngredientPayload[]) => void;
	ingredientOptions: Ingredient[];
	setFormError: (value: string | null) => void;
}

export function RecipeFormIngredient({
	ingredient,
	index,
	ingredients,
	setIngredients,
	ingredientOptions,
	setFormError,
}: RecipeFormIngredientProps) {
	return (
		// TODO: add a remove button and functionality to remove an ingredient from the recipe
		<FieldGroup
			key={`${ingredient.ingredientId}-${index}`}
			className="grid gap-2 grid-cols-[6fr_2fr_3fr_1fr]"
		>
			<Field>
				<FieldLabel htmlFor={`ingredients[${index}][ingredientId]`} className="sr-only">
					{RECIPE_INGREDIENT_NAME_LABEL}
				</FieldLabel>
				<Autocomplete
					items={ingredientOptions.map((option) => option.name)}
					onValueChange={(value) => {
						const updatedIngredients = [...ingredients];
						updatedIngredients[index].name = value;
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
				<FieldLabel htmlFor={`ingredients[${index}][quantity]`} className="sr-only">
					{RECIPE_INGREDIENT_QUANTITY_LABEL}
				</FieldLabel>
				<Input
					id={`ingredients[${index}][quantity]`}
					type="text"
					autoComplete="off"
					inputMode="numeric"
					value={ingredient.quantity}
					onChange={(e) => {
						const updatedIngredients = [...ingredients];
						updatedIngredients[index].quantity = parseFloat(e.target.value || "0");
						setIngredients(updatedIngredients);
						setFormError(null);
					}}
					placeholder={RECIPE_INGREDIENT_QUANTITY_LABEL}
				/>
			</Field>
			<Field>
				<FieldLabel htmlFor={`ingredients[${index}][unit]`} className="sr-only">
					{RECIPE_INGREDIENT_UNIT_LABEL}
				</FieldLabel>
				<Select
					name={`ingredients[${index}][unit]`}
					value={ingredient.unit}
					onValueChange={(value) => {
						const updatedIngredients = [...ingredients];
						updatedIngredients[index].unit = value as (typeof PURCHASE_UNITS)[number];
						setIngredients(updatedIngredients);
						setFormError(null);
					}}
				>
					<SelectTrigger id={`ingredients[${index}][unit]`} className="w-full">
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
				<Button
					type="button"
					variant="outline"
					onClick={() => console.log("delete recipe ingredient click")}
				>
					<X />
					<span className="sr-only">{RECIPE_INGREDIENT_DELETE_LABEL}</span>
				</Button>
			</Field>
		</FieldGroup>
	);
}
