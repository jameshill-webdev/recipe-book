import {
	PURCHASE_UNITS,
	TIME_UNITS,
	type PurchaseUnit,
	type TimeUnit,
} from "@recipe-book/shared/lib/units";

export function formatPurchaseUnit(unit: PurchaseUnit, value: number): string {
	const plural = value > 1;
	switch (unit) {
		case PURCHASE_UNITS[0]:
			return `g${plural ? "s" : ""}`;
		case PURCHASE_UNITS[1]:
			return `kg${plural ? "s" : ""}`;
		case PURCHASE_UNITS[2]:
			return `ml${plural ? "s" : ""}`;
		case PURCHASE_UNITS[3]:
			return `l${plural ? "s" : ""}`;
		case PURCHASE_UNITS[4]:
			return `oz${plural ? "s" : ""}`;
		case PURCHASE_UNITS[5]:
			return `lb${plural ? "s" : ""}`;
		case PURCHASE_UNITS[6]:
			return `pt${plural ? "s" : ""}`;
		case PURCHASE_UNITS[7]:
			return `pack${plural ? "s" : ""}`;
		case PURCHASE_UNITS[8]:
		default:
			return `unit${plural ? "s" : ""}`;
	}
}

export function formatTimeUnit(unit: TimeUnit, value: number): string {
	const plural = value > 1;
	switch (unit) {
		case TIME_UNITS[0]:
			return `second${plural ? "s" : ""}`;
		case TIME_UNITS[1]:
			return `minute${plural ? "s" : ""}`;
		case TIME_UNITS[2]:
			return `hour${plural ? "s" : ""}`;
		case TIME_UNITS[3]:
			return `day${plural ? "s" : ""}`;
		default:
			return "time unit";
	}
}
