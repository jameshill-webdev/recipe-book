import { getRecipeById } from "@/lib/api/recipes";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { getErrorMessage } from "@/lib/utils";
import { InlineError } from "@/components/ui/error/error";
import type { ResponseRecipe } from "@recipe-book/shared/types/recipe";
import RecipeDetailsIngredient from "@/components/recipe-details-ingredient/recipe-details-ingredient";
import type { PurchaseUnit } from "@recipe-book/shared/lib/units";

export default function RecipeDetails() {
	const { id } = useParams();

	const {
		data: recipe = undefined,
		isPending: isRecipePending,
		error: recipesError,
	} = useQuery({
		queryKey: ["recipeDetails"],
		queryFn: () => {
			if (!id) {
				return null;
			}
			return getRecipeById(id);
		},
	});

	return (
		<>
			{isRecipePending ? (
				<p>Loading recipe details...</p>
			) : !recipe ? (
				<p>Recipe not found</p>
			) : recipesError ? (
				<InlineError alert>{getErrorMessage(recipesError)}</InlineError>
			) : (
				<article>
					<h1>{(recipe as ResponseRecipe)?.name}</h1>
					<div className="w-full flex flex-col gap-4">
						<dl className="grid grid-cols-2 gap-2">
							<div className="flex gap-1">
								<dt>Prep time:</dt>
								<dd>
									{recipe.prepTime} {recipe.prepTimeUnit.toLocaleLowerCase()}
								</dd>
							</div>
							<div className="flex gap-1">
								<dt>Cook time:</dt>
								<dd>
									{recipe.cookTime} {recipe.cookTimeUnit.toLocaleLowerCase()}
								</dd>
							</div>
							<div className="flex gap-1">
								<dt>Shelf life:</dt>
								<dd>{recipe.shelfLifeDays} days</dd>
							</div>
							<div className="flex gap-1">
								<dt>Portions:</dt>
								<dd>{recipe.portions}</dd>
							</div>
						</dl>
						<h2 className="text-center">Ingredients</h2>
						<ul>
							{(recipe as ResponseRecipe)?.ingredients.map((item, index) => (
								<li key={`${item.ingredient.id}-${index}`}>
									<RecipeDetailsIngredient
										name={item.ingredient.name}
										quantity={item.quantity}
										unit={item.unit as PurchaseUnit}
									/>
								</li>
							))}
						</ul>
						<h2 className="text-center">Method</h2>
						<div>
							{recipe?.method
								.split("\n")
								.filter((item) => item.trim().length > 0)
								.map((validItem) => (
									<p className="mb-2" key={validItem}>
										{validItem}
									</p>
								))}
						</div>
					</div>
				</article>
			)}
		</>
	);
}
