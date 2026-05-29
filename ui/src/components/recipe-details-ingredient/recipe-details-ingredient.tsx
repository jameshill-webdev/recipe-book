import type { PurchaseUnit } from "@recipe-book/shared/lib/units";
import { Item, ItemContent } from "../ui/item/item";

export default function RecipeDetailsIngredient({
	name,
	quantity,
	unit,
}: {
	name: string;
	quantity: number;
	unit: PurchaseUnit;
}) {
	const formattedUnit = unit.toLocaleLowerCase();

	return (
		<>
			<div className="flex flex-col gap-2 mb-1">
				<Item
					data-testid="ingredient-item"
					size="sm"
					variant="outline"
					className="p-1.5 items-stretch"
				>
					<ItemContent>
						<span>
							{name}, {quantity} {quantity > 1 ? `${formattedUnit}s` : formattedUnit}
						</span>
					</ItemContent>
				</Item>
			</div>
		</>
	);
}
