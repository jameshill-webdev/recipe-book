import { Item, ItemActions, ItemContent, ItemTitle } from "@/components/ui/item/item";
import { Button } from "../ui/button/button";
import { Pencil } from "lucide-react";
import { INGREDIENT_ITEM_EDIT_BUTTON_LABEL } from "@/lib/content-strings";

interface IngredientItemProps {
	name: string;
}

export function IngredientItem({ name }: IngredientItemProps) {
	function onEdit() {
		console.log("Edit ingredient");
	}

	return (
		<div className="flex flex-col gap-2 mb-2">
			<Item data-testid="ingredient-item" size="sm" variant="outline" className="p-1.5 pl-4">
				<ItemContent>
					<ItemTitle>{name}</ItemTitle>
				</ItemContent>
				<ItemActions>
					<Button type="button" variant="outline" onClick={onEdit}>
						<Pencil />
						<span className="sr-only">{INGREDIENT_ITEM_EDIT_BUTTON_LABEL}</span>
					</Button>
				</ItemActions>
			</Item>
		</div>
	);
}
