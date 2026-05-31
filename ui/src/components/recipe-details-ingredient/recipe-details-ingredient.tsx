import type { PurchaseUnit } from "@recipe-book/shared/lib/units";
import { Item, ItemContent } from "../ui/item/item";
import { formatPurchaseUnit } from "@/lib/formatting";

interface RecipeDetailsIngredientProps {
	name: string;
	quantity: number;
	unit: PurchaseUnit;
}

export default function RecipeDetailsIngredient({
	name,
	quantity,
	unit,
}: RecipeDetailsIngredientProps) {
	const formattedUnit = formatPurchaseUnit(unit, quantity);

	return (
		<>
			<div className="flex flex-col gap-2 mb-1">
				<Item
					data-testid="ingredient-item"
					size="sm"
					variant="outline"
					className="px-3 py-2 items-stretch"
				>
					<ItemContent>
						<span>
							{name}, {quantity} {formattedUnit}
						</span>
					</ItemContent>
				</Item>
			</div>
		</>
	);
}
