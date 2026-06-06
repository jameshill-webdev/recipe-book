import { useState } from "react";
import type {
	Duration,
	Recipe,
	CreateRecipeIngredientPayload,
} from "@recipe-book/shared/types/recipe";
import { EDIT_RECIPE_FORM_LABEL } from "@/lib/content-strings";
import {
	DEFAULT_PREP_TIME_UNIT,
	DEFAULT_COOK_TIME_UNIT,
	DEFAULT_SHELF_LIFE_UNIT,
} from "@/lib/constants";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getIngredients } from "@/lib/api/ingredients";
import type { Ingredient } from "@recipe-book/shared/types/ingredient";
import { useCreateIngredient } from "@/hooks/use-create-ingredient";
import type { PurchaseUnit, TimeUnit } from "@recipe-book/shared/lib/units";
import { updateRecipe } from "@/lib/api/recipes";
import { getErrorMessage } from "@/lib/utils";
import { RecipeForm } from "../recipe-form/recipe-form";

interface EditRecipeDetailsProps {
	recipe: Recipe;
}

export default function EditRecipeDetails({ recipe }: EditRecipeDetailsProps) {
	const queryClient = useQueryClient();

	const {
		data: ingredientOptions = [],
		isPending: isIngredientsPending,
		error: ingredientsError,
	} = useQuery({
		queryKey: ["ingredients"],
		queryFn: getIngredients,
	});

	const [name, setName] = useState(recipe.name);
	// TODO: add validation to prevent user adding duplicate ingredients (name or purchase unit must be different)
	const [ingredients, setIngredients] = useState<CreateRecipeIngredientPayload[]>(
		recipe.ingredients.map((responseIngredient) => ({
			ingredientId: responseIngredient.ingredient.id,
			name: responseIngredient.ingredient.name,
			unit: responseIngredient.unit as PurchaseUnit,
			quantity: responseIngredient.quantity,
		})),
	);
	const [method, setMethod] = useState(recipe.method);
	const [prepTime, setPrepTime] = useState<Duration>({
		time: recipe.prepTime,
		unit: recipe.prepTimeUnit as TimeUnit,
	});
	const [cookTime, setCookTime] = useState<Duration>({
		time: recipe.cookTime,
		unit: recipe.cookTimeUnit as TimeUnit,
	});
	const [shelfLife, setShelfLife] = useState<Duration>({
		time: recipe.shelfLife,
		unit: recipe.shelfLifeUnit as TimeUnit,
	});
	const [numberOfPortions, setNumberOfPortions] = useState(recipe.portions);
	const [formError, setFormError] = useState<string | null>(null);

	const updateRecipeMutation = useMutation({
		mutationFn: updateRecipe,
		onSuccess: async () => {
			setIngredients([]);
			setMethod("");
			setPrepTime({ time: 1, unit: DEFAULT_PREP_TIME_UNIT });
			setCookTime({ time: 1, unit: DEFAULT_COOK_TIME_UNIT });
			setShelfLife({ time: 1, unit: DEFAULT_SHELF_LIFE_UNIT });
			setNumberOfPortions(1);
			setFormError(null);

			await queryClient.invalidateQueries({ queryKey: ["recipes"] });
		},
		onError: (error) => {
			setFormError(getErrorMessage(error));
		},
	});
	const createIngredientMutation = useCreateIngredient(
		() => {},
		(error) => console.error(error),
	);

	async function onEditRecipe(event: React.SubmitEvent) {
		event.preventDefault();
		setFormError(null);

		const validIngredients = ingredients.filter((ingredient) => ingredient.name.trim() !== "");

		if (validIngredients.length === 0) {
			setFormError("Please add at least one ingredient.");
			return;
		}

		const newIngredients = validIngredients.filter((ingredient) => {
			return !ingredientOptions.some(
				(option) => option.name.toLowerCase() === ingredient.name.toLowerCase(),
			);
		});

		let createdIngredients: Ingredient[] = [];

		if (newIngredients.length > 0) {
			createdIngredients = await createIngredientMutation.mutateAsync({
				ingredients: newIngredients.map((ingredient) => ({
					name: ingredient.name.trim(),
					purchaseUnit: ingredient.unit.trim() as PurchaseUnit,
					costPerUnit: 0.1, // TODO: replace with constant or allow user to input cost per unit when creating recipe ingredient
				})),
			});
		}

		const updatedIngredients = ingredients.map((ingredient) => {
			const isNewIngredient = newIngredients.some(
				(newIng) =>
					newIng.name.toLowerCase() === ingredient.name.toLowerCase() &&
					newIng.unit.trim() === ingredient.unit.trim(),
			);

			if (isNewIngredient) {
				return {
					...ingredient,
					ingredientId:
						createdIngredients?.find(
							(created) =>
								created.name.toLowerCase() === ingredient.name.toLowerCase() &&
								created.purchaseUnit === ingredient.unit.trim(),
						)?.id || "",
				};
			}

			const matchingIngredientOption = ingredientOptions.find((option) => {
				return (
					option.name.toLowerCase() === ingredient.name.toLowerCase() &&
					(!isNewIngredient || option.purchaseUnit === ingredient.unit.trim())
				);
			});

			return {
				...ingredient,
				ingredientId: matchingIngredientOption?.id || "",
			};
		});

		updateRecipeMutation.mutate({
			id: recipe.id,
			name: name.trim(),
			ingredients: updatedIngredients,
			method: method.trim(),
			prepTime,
			cookTime,
			shelfLife,
			numberOfPortions,
		});

		setIngredients(updatedIngredients);
	}

	return (
		<>
			<h1>Edit {recipe.name}</h1>
			<RecipeForm
				label={EDIT_RECIPE_FORM_LABEL}
				isEdit={true}
				submitHandler={onEditRecipe}
				name={name}
				setName={setName}
				ingredientOptions={ingredientOptions}
				isIngredientsPending={isIngredientsPending}
				ingredientsError={ingredientsError}
				ingredients={ingredients}
				setIngredients={setIngredients}
				method={method}
				setMethod={setMethod}
				prepTime={prepTime}
				setPrepTime={setPrepTime}
				cookTime={cookTime}
				setCookTime={setCookTime}
				shelfLife={shelfLife}
				setShelfLife={setShelfLife}
				numberOfPortions={numberOfPortions}
				setNumberOfPortions={setNumberOfPortions}
				mutation={{
					isPending: updateRecipeMutation.isPending,
				}}
				formError={formError}
				setFormError={setFormError}
			/>
		</>
	);
}
