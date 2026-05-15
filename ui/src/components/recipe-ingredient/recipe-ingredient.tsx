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
import { PURCHASE_UNITS } from "@recipe-book/shared/lib/units";

interface RecipeIngredientProps {
	ingredient: RecipeIngredient;
	index: number;
	ingredients: RecipeIngredient[];
	setIngredients: (value: RecipeIngredient[]) => void;
	setFormError: (value: string | null) => void;
}

export function RecipeIngredient({
	ingredient,
	index,
	ingredients,
	setIngredients,
	setFormError,
}: RecipeIngredientProps) {
	return (
		<FieldGroup key={`${ingredient.ingredientId}-${index}`}>
			<Field>
				<FieldLabel htmlFor={`ingredients[${index}][ingredientId]`} className="sr-only">
					Ingredient
				</FieldLabel>
				{/* TODO: implement textbox with realtime search for ingredient name */}
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
