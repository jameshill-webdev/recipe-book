import type { Recipe } from "@recipe-book/shared/types/recipe";
import RecipeDetailsIngredient from "../recipe-details-ingredient/recipe-details-ingredient";
import type { PurchaseUnit, TimeUnit } from "@recipe-book/shared/lib/units";
import { formatTimeUnit } from "@/lib/formatting";
import {
	RECIPE_DETAILS_COOKING_TIME_LABEL,
	RECIPE_DETAILS_INGREDIENTS_LABEL,
	RECIPE_DETAILS_METHOD_LABEL,
	RECIPE_DETAILS_PORTIONS_LABEL,
	RECIPE_DETAILS_PREPARATION_TIME_LABEL,
	RECIPE_DETAILS_SHELF_LIFE_LABEL,
} from "@/lib/content-strings";

interface RecipeDetailsProps {
	recipe: Recipe;
}

export default function ViewRecipeDetails({ recipe }: RecipeDetailsProps) {
	return (
		<article>
			<div className="w-full flex flex-col gap-4">
				<dl className="grid grid-cols-2 gap-2">
					<div className="flex gap-1">
						<dt>{RECIPE_DETAILS_PREPARATION_TIME_LABEL}:</dt>
						<dd>
							{recipe.prepTime}{" "}
							{formatTimeUnit(recipe.prepTimeUnit as TimeUnit, recipe.prepTime)}
						</dd>
					</div>
					<div className="flex gap-1">
						<dt>{RECIPE_DETAILS_COOKING_TIME_LABEL}:</dt>
						<dd>
							{recipe.cookTime}{" "}
							{formatTimeUnit(recipe.cookTimeUnit as TimeUnit, recipe.cookTime)}
						</dd>
					</div>
					<div className="flex gap-1">
						<dt>{RECIPE_DETAILS_SHELF_LIFE_LABEL}:</dt>
						<dd>
							{recipe.shelfLife}{" "}
							{formatTimeUnit(recipe.shelfLifeUnit as TimeUnit, recipe.shelfLife)}
						</dd>
					</div>
					<div className="flex gap-1">
						<dt>{RECIPE_DETAILS_PORTIONS_LABEL}:</dt>
						<dd>{recipe.portions}</dd>
					</div>
				</dl>
				<h2 className="text-center">{RECIPE_DETAILS_INGREDIENTS_LABEL}</h2>
				<ul>
					{(recipe as Recipe)?.ingredients.map((item, index) => (
						<li key={`${item.ingredient.id}-${index}`}>
							<RecipeDetailsIngredient
								name={item.ingredient.name}
								quantity={item.quantity}
								unit={item.unit as PurchaseUnit}
							/>
						</li>
					))}
				</ul>
				<h2 className="text-center">{RECIPE_DETAILS_METHOD_LABEL}</h2>
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
	);
}
