import { RecipeForm } from "@/components/recipe-form/recipe-form";
import { Button } from "@/components/ui/button/button";
import { CREATE_RECIPE_FORM_LABEL, RECIPES_PAGE_HEADING } from "@/lib/content-strings";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { getIngredients } from "@/lib/api/ingredients";
import type { RecipeIngredient, Duration } from "@recipe-book/shared/types/recipe";
import { createRecipe } from "@/lib/api/recipes";
import { getErrorMessage } from "@/lib/utils";
import { useCreateIngredient } from "@/hooks/use-create-ingredient";
import type { PurchaseUnit } from "@recipe-book/shared/lib/units";

const DEFAULT_PREP_TIME_UNIT = "MINUTES";
const DEFAULT_COOK_TIME_UNIT = "MINUTES";
const DEFAULT_SHELF_LIFE_UNIT = "DAYS";

export default function Recipes() {
	const queryClient = useQueryClient();
	const [addRecipeUIOpen, setAddRecipeUIOpen] = useState(false);

	const {
		data: ingredientOptions = [],
		isPending: isIngredientsPending,
		error: ingredientsError,
	} = useQuery({
		queryKey: ["ingredients"],
		queryFn: getIngredients,
	});

	const [name, setName] = useState("");
	const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
	const [method, setMethod] = useState("");
	const [prepTime, setPrepTime] = useState<Duration>({ time: 0, unit: DEFAULT_PREP_TIME_UNIT });
	const [cookTime, setCookTime] = useState<Duration>({ time: 0, unit: DEFAULT_COOK_TIME_UNIT });
	const [shelfLife, setShelfLife] = useState<Duration>({
		time: 0,
		unit: DEFAULT_SHELF_LIFE_UNIT,
	});
	const [numberOfPortions, setNumberOfPortions] = useState(1);
	const [costPerPortion, setCostPerPortion] = useState(0);
	const [formError, setFormError] = useState<string | null>(null);

	const createRecipeMutation = useMutation({
		mutationFn: createRecipe,
		onSuccess: async () => {
			setIngredients([]);
			setMethod("");
			setPrepTime({ time: 0, unit: DEFAULT_PREP_TIME_UNIT });
			setCookTime({ time: 0, unit: DEFAULT_COOK_TIME_UNIT });
			setShelfLife({ time: 0, unit: DEFAULT_SHELF_LIFE_UNIT });
			setNumberOfPortions(1);
			setCostPerPortion(0);
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

	function onCreateRecipe(event: React.SubmitEvent) {
		event.preventDefault();
		setFormError(null);

		// check each ingredient against existing ingredient options and create new ingredients for any that don't already exist
		ingredients
			.filter((ingredient) => {
				return !ingredientOptions.some(
					(option) => option.name.toLowerCase() === ingredient.name.toLowerCase(),
				);
			})
			.forEach((newIngredient) => {
				console.log("Creating new ingredient:", newIngredient.name);

				// TODO: this should be refactored to batch create new ingredients and handle duplicates
				// TODO: recipe creation should be awaited until all new ingredients have been created and their IDs returned, so the recipe can be created with the correct ingredient IDs (currently they are sent without ids, which necessitates matching by name on the server, which then necessitates unique names)
				createIngredientMutation.mutate({
					ingredients: [
						{
							name: newIngredient.name.trim(),
							purchaseUnit: newIngredient.unit.trim() as PurchaseUnit,
							costPerUnit: 0.1, // TODO: replace with constant or allow user to input cost per unit when creating recipe ingredient
						},
					],
				});
			});

		createRecipeMutation.mutate({
			name: name.trim(),
			ingredients,
			method: method.trim(),
			prepTime,
			cookTime,
			shelfLife,
			numberOfPortions,
			costPerPortion,
		});
	}

	return (
		<>
			<h1>{RECIPES_PAGE_HEADING}</h1>
			<div className="flex flex-col gap-4 mb-8">
				<Button
					className="w-[10rem] mx-auto"
					type="button"
					variant="outline"
					onClick={onAddRecipe}
					aria-label="Add recipe"
					aria-expanded={addRecipeUIOpen}
					aria-controls="add-recipe-form-container"
				>
					{addRecipeUIOpen ? <Minus /> : <Plus />}
					<span>{addRecipeUIOpen ? "Close" : "Add recipe"}</span>
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
							costPerPortion={costPerPortion}
							setCostPerPortion={setCostPerPortion}
							mutation={{
								isPending: createRecipeMutation.isPending,
							}}
							formError={formError}
							setFormError={setFormError}
						/>
					)}
				</div>
			</div>
		</>
	);
}
