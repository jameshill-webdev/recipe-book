import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, X } from "lucide-react";
import { PURCHASE_UNITS } from "@recipe-book/shared/lib/purchase-units";
import { InlineError } from "@/components/ui/error/error";
import { Input } from "@/components/ui/input/input";
import { Item, ItemActions, ItemContent, ItemTitle } from "@/components/ui/item/item";
import {
	EDIT_INGREDIENT_FORM_LABEL,
	GENERIC_ERROR,
	INGREDIENT_ITEM_EDIT_BUTTON_LABEL,
	NETWORK_ERROR,
} from "@/lib/content-strings";
import type {
	CreateIngredientPayload,
	Ingredient,
	IngredientMutationResponse,
} from "@/lib/types/ingredient";
import { Button } from "../ui/button/button";
import { Field, FieldLabel } from "../ui/field/field";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select/select";

type IngredientItemProps = Pick<Ingredient, "id" | "name" | "purchaseUnit" | "costPerUnit">;

type UpdateIngredientPayload = {
	id: string;
} & Partial<CreateIngredientPayload>;

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? window.location.origin).replace(/\/$/, "");

function getErrorMessage(error: unknown) {
	if (error instanceof TypeError) {
		return NETWORK_ERROR;
	}

	return error instanceof Error ? error.message : GENERIC_ERROR;
}

async function updateIngredient({ id, ...payload }: UpdateIngredientPayload) {
	const response = await fetch(`${apiBaseUrl}/ingredients/${id}`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(payload),
	});

	const data = (await response.json().catch(() => null)) as IngredientMutationResponse | null;

	if (!response.ok) {
		throw new Error(data?.message ?? GENERIC_ERROR);
	}

	return data;
}

export function IngredientItem({ id, name, purchaseUnit, costPerUnit }: IngredientItemProps) {
	const queryClient = useQueryClient();
	const [isEditing, setIsEditing] = useState(false);
	const [newName, setNewName] = useState(name);
	const [newPurchaseUnit, setNewPurchaseUnit] = useState(purchaseUnit);
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

	function onEdit() {
		setNewName(name);
		setNewPurchaseUnit(purchaseUnit);
		setNewCostPerUnit(costPerUnit);
		setFormError(null);
		setIsEditing(true);
	}

	function onCancel() {
		setFormError(null);
		setIsEditing(false);
	}

	function onEditSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFormError(null);

		const trimmedName = newName.trim();
		const trimmedPurchaseUnit = newPurchaseUnit.trim();
		const parsedCostPerUnit = Number(newCostPerUnit);
		const originalCostPerUnit = Number(costPerUnit);

		if (!trimmedName) {
			setFormError("Name is required.");
			return;
		}

		if (!trimmedPurchaseUnit) {
			setFormError("Please select a purchase unit.");
			return;
		}

		if (!Number.isFinite(parsedCostPerUnit) || parsedCostPerUnit < 0) {
			setFormError("Please enter a valid non-negative cost per unit.");
			return;
		}

		const payload: UpdateIngredientPayload = { id };

		if (trimmedName !== name) {
			payload.name = trimmedName;
		}

		if (trimmedPurchaseUnit !== purchaseUnit) {
			payload.purchaseUnit = trimmedPurchaseUnit;
		}

		if (parsedCostPerUnit !== originalCostPerUnit) {
			payload.costPerUnit = parsedCostPerUnit;
		}

		if (Object.keys(payload).length === 1) {
			setIsEditing(false);
			return;
		}

		updateIngredientMutation.mutate(payload);
	}

	return (
		<div className="flex flex-col gap-2 mb-2">
			<Item data-testid="ingredient-item" size="sm" variant="outline" className="p-1.5 pl-4">
				<ItemContent className="flex flex-row justify-between">
					{isEditing ? (
						// TODO: de-duplicate into component (share between create and edit forms)
						<form
							onSubmit={onEditSubmit}
							className="grid grid-cols-[4fr_2fr_2fr_1fr] gap-4 items-end"
							aria-label={EDIT_INGREDIENT_FORM_LABEL}
						>
							<Field>
								<FieldLabel className="sr-only" htmlFor={`name-${id}`}>
									Name
								</FieldLabel>
								<Input
									id={`name-${id}`}
									type="text"
									autoComplete="off"
									value={newName}
									onChange={(e) => {
										setNewName(e.target.value);
										setFormError(null);
									}}
									placeholder="Name"
									required
								/>
							</Field>
							<Field>
								<FieldLabel className="sr-only" htmlFor={`purchaseUnit-${id}`}>
									Purchase unit
								</FieldLabel>
								<Select
									value={newPurchaseUnit}
									onValueChange={(value) => {
										setNewPurchaseUnit(value);
										setFormError(null);
									}}
									required
								>
									<SelectTrigger
										id={`purchaseUnit-${id}`}
										className="w-full max-w-48"
									>
										<SelectValue placeholder="Select a unit" />
									</SelectTrigger>
									<SelectContent>
										{PURCHASE_UNITS.map((unit) => (
											<SelectItem key={unit} value={unit}>
												{unit.toLocaleLowerCase()}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</Field>
							<Field>
								<FieldLabel className="sr-only" htmlFor={`costPerUnit-${id}`}>
									Cost per unit
								</FieldLabel>
								<Input
									id={`costPerUnit-${id}`}
									type="number"
									autoComplete="off"
									inputMode="decimal"
									min="0"
									step="0.01"
									value={newCostPerUnit}
									onChange={(e) => {
										setNewCostPerUnit(e.target.value);
										setFormError(null);
									}}
									placeholder="Cost per unit"
									required
								/>
							</Field>
							<Field>
								<Button type="submit" disabled={updateIngredientMutation.isPending}>
									{updateIngredientMutation.isPending ? "Saving..." : "Save"}
								</Button>
							</Field>
							{formError && <InlineError alert>{formError}</InlineError>}
						</form>
					) : (
						<>
							<ItemTitle>{name}</ItemTitle>
							<div className="flex flex-row gap-1">
								<span>{costPerUnit}</span>
								<span>/</span>
								<span>{purchaseUnit}</span>
							</div>
						</>
					)}
				</ItemContent>
				<ItemActions>
					{/* TODO: implement delete button and supporting functionality */}
					<Button type="button" variant="outline" onClick={isEditing ? onCancel : onEdit}>
						{isEditing ? <X /> : <Pencil />}
						<span className="sr-only">{INGREDIENT_ITEM_EDIT_BUTTON_LABEL}</span>
					</Button>
				</ItemActions>
			</Item>
		</div>
	);
}
