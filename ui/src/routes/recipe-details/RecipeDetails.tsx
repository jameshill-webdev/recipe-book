import { getRecipeById } from "@/lib/api/recipes";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getErrorMessage } from "@/lib/utils";
import { InlineError } from "@/components/ui/error/error";
import ViewRecipeDetails from "@/components/view-recipe-details/view-recipe-details";
import { useState } from "react";
import EditRecipeDetails from "@/components/edit-recipe-details/edit-recipe-details";
import { Button } from "@/components/ui/button/button";
import { Pencil, X } from "lucide-react";
import { RECIPE_ITEM_EDIT_BUTTON_LABEL } from "@/lib/content-strings";

export default function RecipeDetailsPage() {
	const { id } = useParams();
	const [isEditing, setIsEditing] = useState(false);

	const {
		data: recipe = undefined,
		isPending: isRecipePending,
		error: recipesError,
	} = useQuery({
		queryKey: ["recipeDetails", id],
		queryFn: () => {
			if (!id) {
				return null;
			}
			return getRecipeById(id);
		},
	});

	console.log(JSON.stringify(recipe));

	return (
		<div>
			<div className="my-8 w-full flex justify-center gap-2">
				<h1 className="my-0">{recipe?.name || ""}</h1>
				<Button type="button" variant="outline" onClick={() => setIsEditing(!isEditing)}>
					{isEditing ? <X /> : <Pencil />}
					<span className="sr-only">{RECIPE_ITEM_EDIT_BUTTON_LABEL}</span>
				</Button>
			</div>
			{isRecipePending ? (
				<p>Loading recipe details...</p>
			) : !recipe ? (
				<p>Recipe not found</p>
			) : recipesError ? (
				<InlineError alert>{getErrorMessage(recipesError)}</InlineError>
			) : isEditing ? (
				<EditRecipeDetails recipe={recipe} />
			) : (
				<ViewRecipeDetails recipe={recipe} />
			)}
		</div>
	);
}
