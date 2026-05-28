import type { Recipe } from "@recipe-book/shared/types/recipe";
import { Item, ItemActions, ItemContent, ItemTitle } from "../ui/item/item";
import { ChevronRightIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface RecipeListProps {
	recipes: Recipe[];
}

export function RecipeList({ recipes }: RecipeListProps) {
	return (
		<ul className="p-0 list-none">
			{recipes.map((recipe, index) => (
				<li key={`${recipe.id}_${index}`} className="flex flex-row mb-1">
					<Item
						data-testid="recipe-list-item"
						size="sm"
						variant="outline"
						className="p-0 items-stretch w-full overflow-hidden"
					>
						<Link
							to="/"
							className="flex p-3 w-full justify-between [a]:transition-colors [a]:hover:bg-muted [a]:focus:bg-muted"
						>
							<ItemContent>
								<ItemTitle>{recipe.name}</ItemTitle>
							</ItemContent>
							<ItemActions>
								<ChevronRightIcon className="size-4" />
							</ItemActions>
						</Link>
					</Item>
				</li>
			))}
		</ul>
	);
}
