import { getRecipeById } from "@/lib/api/recipes";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getErrorMessage } from "@/lib/utils";
import { InlineError } from "@/components/ui/error/error";
import ViewRecipeDetails from "@/components/view-recipe-details/view-recipe-details";
import { useState } from "react";
import EditRecipeDetails from "@/components/edit-recipe-details/edit-recipe-details";
import { Button } from "@/components/ui/button/button";
import { Pencil, X } from "lucide-react";
import { RECIPE_DETAILS_NOT_FOUND, RECIPE_ITEM_EDIT_BUTTON_LABEL } from "@/lib/content-strings";
import { LoadingSpinner } from "@/components/loading-spinner/loading-spinner";

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
	const queryClient = useQueryClient();

	return (
		<div data-testid="recipe-details-page">
			<div className="my-8 w-full flex justify-center gap-6">
				<h1 className="my-0">{recipe?.name || ""}</h1>
				<Button type="button" variant="outline" onClick={() => setIsEditing(!isEditing)}>
					{isEditing ? <X /> : <Pencil />}
					<span className="sr-only">{RECIPE_ITEM_EDIT_BUTTON_LABEL}</span>
				</Button>
			</div>
			{isRecipePending ? (
				<LoadingSpinner />
			) : recipesError ? (
				<InlineError alert>{getErrorMessage(recipesError)}</InlineError>
			) : !recipe ? (
				<p>{RECIPE_DETAILS_NOT_FOUND}</p>
			) : isEditing ? (
				<EditRecipeDetails
					recipe={recipe}
					onSubmit={async () => {
						await queryClient.invalidateQueries({
							queryKey: ["recipeDetails", id],
							exact: true,
						});
						setIsEditing(false);
					}}
				/>
			) : (
				<ViewRecipeDetails recipe={recipe} />
			)}
		</div>
	);
}
