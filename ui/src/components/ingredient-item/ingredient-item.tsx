import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, X, Trash2 } from "lucide-react";
import { Item, ItemActions, ItemContent, ItemTitle } from "@/components/ui/item/item";
import {
	CONFIRM_DELETE_INGREDIENT_WARNING,
	EDIT_INGREDIENT_FORM_LABEL,
	GENERIC_ERROR,
	INGREDIENT_COST_REQUIRED_ERROR,
	INGREDIENT_ITEM_COST_ARIA_LABEL,
	INGREDIENT_ITEM_DELETE_BUTTON_LABEL,
	INGREDIENT_ITEM_EDIT_BUTTON_LABEL,
	INGREDIENT_ITEM_NAME_ARIA_LABEL,
	INGREDIENT_ITEM_UNIT_ARIA_LABEL,
	INGREDIENT_NAME_REQUIRED_ERROR,
	INGREDIENT_UNIT_REQUIRED_ERROR,
	NETWORK_ERROR,
} from "@/lib/content-strings";
import type { UpdateIngredientPayload, Ingredient } from "@recipe-book/shared/types/ingredient";
import { Button } from "../ui/button/button";
import { IngredientForm } from "../ingredient-form/ingredient-form";
import { updateIngredient, deleteIngredient } from "@/lib/api/ingredients";
import type { PurchaseUnit } from "@recipe-book/shared/lib/units";

type IngredientItemProps = Pick<Ingredient, "id" | "name" | "purchaseUnit" | "costPerUnit">;

const DEFAULT_PURCHASE_UNIT: PurchaseUnit = "UNIT";

// TODO: replace with shared lib version
function getErrorMessage(error: unknown) {
	if (error instanceof TypeError) {
		return NETWORK_ERROR;
	}

	return error instanceof Error ? error.message : GENERIC_ERROR;
}

export function IngredientItem({ id, name, purchaseUnit, costPerUnit }: IngredientItemProps) {
	const queryClient = useQueryClient();
	const [isEditing, setIsEditing] = useState(false);
	const [newName, setNewName] = useState(name);
	const [newPurchaseUnit, setNewPurchaseUnit] = useState<PurchaseUnit>(
		purchaseUnit || DEFAULT_PURCHASE_UNIT,
	);
	const [newCostPerUnit, setNewCostPerUnit] = useState(costPerUnit);
	const [formError, setFormError] = useState<string | null>(null);

	const updateIngredientMutation = useMutation({
		mutationFn: updateIngredient,
		onSuccess: async () => {
			setFormError(null);
			setIsEditing(false);
			await queryClient.invalidateQueries({ queryKey: ["ingredients"] });
		},
		onError: (error) => {
			setFormError(getErrorMessage(error));
		},
	});

	const deleteIngredientMutation = useMutation({
		mutationFn: deleteIngredient,
		onSuccess: async () => {
			setFormError(null);
			await queryClient.invalidateQueries({ queryKey: ["ingredients"] });
		},
		onError: (error) => {
			setFormError(getErrorMessage(error));
		},
	});

	function onEdit() {
		setNewName(name);
		setNewPurchaseUnit(purchaseUnit);
		setNewCostPerUnit(costPerUnit.toString());
		setFormError(null);
		setIsEditing(true);
	}

	function onCancel() {
		setFormError(null);
		setIsEditing(false);
	}

	function onDelete(event: React.MouseEvent) {
		event.preventDefault();
		setFormError(null);

		if (!window.confirm(CONFIRM_DELETE_INGREDIENT_WARNING)) {
			return;
		}

		deleteIngredientMutation.mutate({ id });
	}

	function onEditSubmit(event: React.SubmitEvent) {
		event.preventDefault();
		setFormError(null);

		const trimmedName = newName.trim();
		const trimmedPurchaseUnit = newPurchaseUnit.trim();
		const parsedCostPerUnit = Number(newCostPerUnit);
		const originalCostPerUnit = Number(costPerUnit);

		if (!trimmedName) {
			setFormError(INGREDIENT_NAME_REQUIRED_ERROR);
			return;
		}

		if (!trimmedPurchaseUnit) {
			setFormError(INGREDIENT_UNIT_REQUIRED_ERROR);
			return;
		}

		if (!Number.isFinite(parsedCostPerUnit) || parsedCostPerUnit < 0) {
			setFormError(INGREDIENT_COST_REQUIRED_ERROR);
			return;
		}

		const payload: UpdateIngredientPayload = { id };

		if (trimmedName !== name) {
			payload.name = trimmedName;
		}

		if (trimmedPurchaseUnit !== purchaseUnit) {
			payload.purchaseUnit = trimmedPurchaseUnit as PurchaseUnit;
		}

		if (parsedCostPerUnit !== originalCostPerUnit) {
			payload.costPerUnit = parsedCostPerUnit;
		}

		if (Object.keys(payload).length === 0) {
			setIsEditing(false);
			return;
		}

		updateIngredientMutation.mutate(payload);
	}

	return (
		<div className="flex flex-col gap-2 mb-1">
			<Item
				data-testid="ingredient-item"
				size="sm"
				variant="outline"
				className="p-1.5 items-stretch"
			>
				<ItemContent className="flex flex-row justify-between items-center">
					{isEditing ? (
						<IngredientForm
							label={EDIT_INGREDIENT_FORM_LABEL}
							isEdit
							submitHandler={onEditSubmit}
							name={newName}
							setName={setNewName}
							purchaseUnit={newPurchaseUnit}
							setPurchaseUnit={setNewPurchaseUnit}
							costPerUnit={newCostPerUnit}
							setCostPerUnit={setNewCostPerUnit}
							mutation={updateIngredientMutation}
							formError={formError}
							setFormError={setFormError}
						/>
					) : (
						<div className="w-full grid grid-cols-[4.5fr_2fr_2fr] md:grid-cols-[6.5fr_2fr_2fr]">
							<ItemTitle
								className="pl-2"
								aria-label={`${INGREDIENT_ITEM_NAME_ARIA_LABEL} ${name}`}
							>
								{name}
							</ItemTitle>
							<span
								className=""
								aria-label={`${INGREDIENT_ITEM_COST_ARIA_LABEL} ${Number(costPerUnit).toFixed(2)}`}
							>
								{Number(costPerUnit).toFixed(2)}
							</span>
							<span
								aria-label={`${INGREDIENT_ITEM_UNIT_ARIA_LABEL} ${purchaseUnit.toLocaleLowerCase()}`}
							>
								{purchaseUnit.toLocaleLowerCase()}
							</span>
						</div>
					)}
				</ItemContent>
				<ItemActions
					className={`flex ${isEditing ? "flex-col justify-start" : "flex-row justify-end"}`}
				>
					<Button type="button" variant="outline" onClick={isEditing ? onCancel : onEdit}>
						{isEditing ? <X /> : <Pencil />}
						<span className="sr-only">
							{INGREDIENT_ITEM_EDIT_BUTTON_LABEL}: {name}
						</span>
					</Button>
					{!isEditing && (
						<Button type="button" variant="outline" onClick={onDelete}>
							<Trash2 />
							<span className="sr-only">
								{INGREDIENT_ITEM_DELETE_BUTTON_LABEL}: {name}
							</span>
						</Button>
					)}
				</ItemActions>
			</Item>
		</div>
	);
}
