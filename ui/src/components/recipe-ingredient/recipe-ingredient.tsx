import { Field, FieldLabel, FieldGroup } from "@/components/ui/field/field";
import { Input } from "@/components/ui/input/input";
import type { RecipeIngredient } from "@recipe-book/shared/types/recipe";
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
import type { IngredientData } from "@recipe-book/shared/types/ingredient";

interface RecipeIngredientProps {
	ingredient: RecipeIngredient;
	index: number;
	ingredients: RecipeIngredient[];
	setIngredients: (value: RecipeIngredient[]) => void;
	ingredientOptions: IngredientData[];
	setFormError: (value: string | null) => void;
}

export function RecipeIngredient({
	ingredient,
	index,
	ingredients,
	setIngredients,
	ingredientOptions,
	setFormError,
}: RecipeIngredientProps) {
	return (
		// TODO: add a remove button and functionality to remove an ingredient from the recipe
		<FieldGroup
			key={`${ingredient.ingredientId}-${index}`}
			className="grid gap-2 grid-cols-[5fr_1fr_2fr]"
		>
			<Field>
				<FieldLabel htmlFor={`ingredients[${index}][ingredientId]`} className="sr-only">
					Ingredient
				</FieldLabel>
				<Autocomplete
					items={ingredientOptions.map((option) => option.name)}
					onValueChange={(value) => {
						const updatedIngredients = [...ingredients];
						updatedIngredients[index].name = value;
						setIngredients(updatedIngredients);
						setFormError(null);
					}}
				>
					<AutocompleteInput />
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
						updatedIngredients[index].quantity = parseFloat(e.target.value);
						setIngredients(updatedIngredients);
						setFormError(null);
					}}
					placeholder="Quantity"
				/>
			</Field>
			<Field>
				<FieldLabel htmlFor={`ingredients[${index}][unit]`} className="sr-only">
					Unit
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
		</FieldGroup>
	);
}
