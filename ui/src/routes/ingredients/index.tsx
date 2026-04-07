import { IngredientItem } from "@/components/ingredient-item/ingredient-item";
import { Button } from "@/components/ui/button/button";
import { CREATE_INGREDIENT_FORM_LABEL, INGREDIENTS_PAGE_HEADING } from "@/lib/content-strings";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Field, FieldLabel } from "@/components/ui/field/field";
import { Input } from "@/components/ui/input/input";

export default function Ingredients() {
	const [addIngredientUIOpen, setAddIngredientUIOpen] = useState(false);
	const [newIngredientName, setNewIngredientName] = useState("");
	const [newIngredientPurchaseUnit, setNewIngredientPurchaseUnit] = useState("");
	const [newIngredientCostPerUnit, setNewIngredientCostPerUnit] = useState("");

	function onAddIngredient() {
		setAddIngredientUIOpen((prev) => !prev);
	}

	function onCreateIngredient() {
		console.log("Create ingredient");
	}

	return (
		<>
			<h1>{INGREDIENTS_PAGE_HEADING}</h1>
			<div className="flex flex-col gap-4 mb-8">
				<ul className="flex flex-row justify-center">
					<li>
						<Button type="button" variant="outline" onClick={onAddIngredient}>
							{addIngredientUIOpen ? <Minus /> : <Plus />}
							<span>Add ingredient</span>
						</Button>
					</li>
				</ul>
				{addIngredientUIOpen && (
					<form
						onSubmit={onCreateIngredient}
						className="mx-auto w-full mt-4 flex flex-col gap-6 justify-start items-start md:grid md:grid-cols-[4fr_2fr_1fr_1fr] md:items-end"
						aria-label={CREATE_INGREDIENT_FORM_LABEL}
					>
						<Field>
							<FieldLabel htmlFor="name">Name</FieldLabel>
							<Input
								id="name"
								type="text"
								autoComplete="off"
								value={newIngredientName}
								onChange={(e) => {
									setNewIngredientName(e.target.value);
								}}
								placeholder="Name"
								required
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="purchaseUnit">Purchase unit</FieldLabel>
							<Input
								id="purchaseUnit"
								type="text"
								autoComplete="off"
								value={newIngredientPurchaseUnit}
								onChange={(e) => {
									setNewIngredientPurchaseUnit(e.target.value);
								}}
								placeholder="Purchase unit"
								required
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="costPerUnit">Cost per unit</FieldLabel>
							<Input
								id="costPerUnit"
								type="text"
								autoComplete="off"
								inputMode="numeric"
								value={newIngredientCostPerUnit}
								onChange={(e) => {
									setNewIngredientCostPerUnit(e.target.value);
								}}
								placeholder="Cost per unit"
								required
							/>
						</Field>
						<Field>
							<Button type="submit" className="mt-4">
								Create ingredient
							</Button>
						</Field>
					</form>
				)}
			</div>
			<div>
				<ul>
					<li>
						<IngredientItem name="Ingredient 1" />
					</li>
					<li>
						<IngredientItem name="Ingredient 2" />
					</li>
					<li>
						<IngredientItem name="Ingredient 3" />
					</li>
				</ul>
			</div>
		</>
	);
}
