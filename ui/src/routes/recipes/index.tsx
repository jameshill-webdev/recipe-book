import { RecipeForm } from "@/components/recipe-form/recipe-form";
import { Button } from "@/components/ui/button/button";
import { CREATE_RECIPE_FORM_LABEL, RECIPES_PAGE_HEADING } from "@/lib/content-strings";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { getIngredients } from "@/lib/api/ingredients";
import type { RecipeIngredient, Duration } from "@/lib/types/recipe";
import { createRecipe } from "@/lib/api/recipes";
import { getErrorMessage } from "@/lib/utils";

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

	function onAddRecipe() {
		setAddRecipeUIOpen((prev) => !prev);
	}

	function onCreateRecipe(event: React.SubmitEvent) {
		event.preventDefault();
		setFormError(null);

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
