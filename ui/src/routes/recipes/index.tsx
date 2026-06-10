import { RecipeForm } from "@/components/recipe-form/recipe-form";
import { Button } from "@/components/ui/button/button";
import {
	FORM_CLOSE_BUTTON_LABEL,
	CREATE_RECIPE_FORM_LABEL,
	RECIPE_FORM_NO_VALID_INGREDIENTS,
	RECIPE_FORM_OPEN_BUTTON_LABEL,
	RECIPES_PAGE_HEADING,
	RECIPE_LIST_LOADING,
	RECIPE_LIST_NO_RESULTS,
} from "@/lib/content-strings";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { getIngredients } from "@/lib/api/ingredients";
import type { CreateRecipeIngredientPayload, Duration } from "@recipe-book/shared/types/recipe";
import { createRecipe, getRecipes } from "@/lib/api/recipes";
import { getErrorMessage } from "@/lib/utils";
import { useCreateIngredient } from "@/hooks/use-create-ingredient";
import type { PurchaseUnit } from "@recipe-book/shared/lib/units";
import { InlineError } from "@/components/ui/error/error";
import type { Ingredient } from "@recipe-book/shared/types/ingredient";
import { RecipeList } from "@/components/recipe-list/recipe-list";
import {
	DEFAULT_PREP_TIME_UNIT,
	DEFAULT_COOK_TIME_UNIT,
	DEFAULT_SHELF_LIFE_UNIT,
	DEFAULT_INGREDIENT_COST_PER_UNIT,
} from "@/lib/constants";

export default function Recipes() {
	const queryClient = useQueryClient();
	const [addRecipeUIOpen, setAddRecipeUIOpen] = useState(false);

	const {
		data: recipes = [],
		isPending: isRecipesPending,
		error: recipesError,
	} = useQuery({
		queryKey: ["recipes"],
		queryFn: getRecipes,
	});
	const {
		data: ingredientOptions = [],
		isPending: isIngredientsPending,
		error: ingredientsError,
	} = useQuery({
		queryKey: ["ingredients"],
		queryFn: getIngredients,
	});

	const [name, setName] = useState("");
	// TODO: add validation to prevent user adding duplicate ingredients (name or purchase unit must be different)
	const [ingredients, setIngredients] = useState<CreateRecipeIngredientPayload[]>([]);
	const [method, setMethod] = useState("");
	const [prepTime, setPrepTime] = useState<Duration>({ time: 1, unit: DEFAULT_PREP_TIME_UNIT });
	const [cookTime, setCookTime] = useState<Duration>({ time: 1, unit: DEFAULT_COOK_TIME_UNIT });
	const [shelfLife, setShelfLife] = useState<Duration>({
		time: 1,
		unit: DEFAULT_SHELF_LIFE_UNIT,
	});
	const [numberOfPortions, setNumberOfPortions] = useState(1);
	const [formError, setFormError] = useState<string | null>(null);

	const createRecipeMutation = useMutation({
		mutationFn: createRecipe,
		onSuccess: async () => {
			setIngredients([]);
			setMethod("");
			setPrepTime({ time: 1, unit: DEFAULT_PREP_TIME_UNIT });
			setCookTime({ time: 1, unit: DEFAULT_COOK_TIME_UNIT });
			setShelfLife({ time: 1, unit: DEFAULT_SHELF_LIFE_UNIT });
			setNumberOfPortions(1);
			setFormError(null);
			setAddRecipeUIOpen(false);

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

	function onAddRecipe() {
		setAddRecipeUIOpen((prev) => !prev);
	}

	async function onCreateRecipe(event: React.SubmitEvent) {
		event.preventDefault();
		setFormError(null);

		const validIngredients = ingredients.filter((ingredient) => ingredient.name.trim() !== "");

		if (validIngredients.length === 0) {
			setFormError(RECIPE_FORM_NO_VALID_INGREDIENTS);
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
					costPerUnit: DEFAULT_INGREDIENT_COST_PER_UNIT,
				})),
			});
		}

		const updatedIngredients = ingredients.map((ingredient) => {
			const isNewIngredient = newIngredients.some(
				(newIngredient) =>
					newIngredient.name.toLowerCase() === ingredient.name.toLowerCase() &&
					newIngredient.unit.trim() === ingredient.unit.trim(),
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

		createRecipeMutation.mutate({
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
			<h1 className="my-8">{RECIPES_PAGE_HEADING}</h1>
			<div className="flex flex-col gap-4 mb-8">
				<Button
					className="w-[10rem] mx-auto"
					type="button"
					variant="outline"
					onClick={onAddRecipe}
					aria-expanded={addRecipeUIOpen}
					aria-controls="add-recipe-form-container"
				>
					{addRecipeUIOpen ? <Minus /> : <Plus />}
					<span>
						{addRecipeUIOpen ? FORM_CLOSE_BUTTON_LABEL : RECIPE_FORM_OPEN_BUTTON_LABEL}
					</span>
				</Button>
				<div id="add-recipe-form-container" role="region">
					{addRecipeUIOpen && (
						<RecipeForm
							label={CREATE_RECIPE_FORM_LABEL}
							submitHandler={onCreateRecipe}
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
								isPending: createRecipeMutation.isPending,
							}}
							formError={formError}
							setFormError={setFormError}
						/>
					)}
				</div>
				<div>
					{isRecipesPending ? (
						<p>{RECIPE_LIST_LOADING}</p>
					) : recipesError ? (
						<InlineError alert>{getErrorMessage(recipesError)}</InlineError>
					) : recipes.length === 0 ? (
						<p className="text-center text-[var(--color-muted-foreground)]">
							{RECIPE_LIST_NO_RESULTS}
						</p>
					) : (
						<RecipeList recipes={recipes} />
					)}
				</div>
			</div>
		</>
	);
}
