import type { ResponseRecipe } from "@recipe-book/shared/types/recipe";
import RecipeDetailsIngredient from "../recipe-details-ingredient/recipe-details-ingredient";
import type { PurchaseUnit, TimeUnit } from "@recipe-book/shared/lib/units";
import { formatTimeUnit } from "@/lib/formatting";

interface RecipeDetailsProps {
	recipe: ResponseRecipe;
}

export default function ViewRecipeDetails({ recipe }: RecipeDetailsProps) {
	console.log(recipe);
	return (
		<article>
			<div className="w-full flex flex-col gap-4">
				<dl className="grid grid-cols-2 gap-2">
					<div className="flex gap-1">
						<dt>Prep time:</dt>
						<dd>
							{recipe.prepTime}{" "}
							{formatTimeUnit(recipe.prepTimeUnit as TimeUnit, recipe.prepTime)}
						</dd>
					</div>
					<div className="flex gap-1">
						<dt>Cook time:</dt>
						<dd>
							{recipe.cookTime}{" "}
							{formatTimeUnit(recipe.cookTimeUnit as TimeUnit, recipe.cookTime)}
						</dd>
					</div>
					<div className="flex gap-1">
						<dt>Shelf life:</dt>
						<dd>
							{recipe.shelfLife}{" "}
							{formatTimeUnit(recipe.shelfLifeUnit as TimeUnit, recipe.shelfLife)}
						</dd>
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
	);
}
