import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InlineError } from "@/components/ui/error";
import { Item, ItemActions, ItemContent, ItemTitle } from "@/components/ui/item";
import { authClient } from "@/lib/auth";
import {
	GENERIC_LOADING,
	LOGIN_BUTTON_TEXT,
	LOGOUT_BUTTON_TEXT,
	LOGOUT_FAILED,
	NETWORK_ERROR,
} from "@/lib/messages";

export function UserMenu() {
	const navigate = useNavigate();
	const { data: sessionData, isPending } = authClient.useSession();
	const [error, setError] = useState<string | null>(null);
	const userName = sessionData?.user?.name ?? null;

	async function onLogout() {
		setError(null);

		try {
			const { error: signOutError } = await authClient.signOut();

			if (signOutError) {
				setError(signOutError.message ?? LOGOUT_FAILED);
				return;
			}

			navigate("/login", { replace: true, state: { loggedOut: true } });
		} catch {
			setError(NETWORK_ERROR);
		}
	}

	if (isPending) {
		return (
			<div className="flex flex-col gap-2">
				<Item data-testid="user-menu" size="sm" variant="outline" className="py-1.5">
					<ItemContent>
						<ItemTitle>{GENERIC_LOADING}</ItemTitle>
					</ItemContent>
				</Item>
				{error && <InlineError>{error}</InlineError>}
			</div>
		);
	}

	if (!userName) {
		return (
			<div className="flex flex-col gap-2">
				<Item data-testid="user-menu" size="sm" variant="outline" className="py-1.5">
					<ItemActions>
						<Button type="button" variant="outline" asChild>
							<Link to="/login">{LOGIN_BUTTON_TEXT}</Link>
						</Button>
					</ItemActions>
				</Item>
				{error && <InlineError>{error}</InlineError>}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			<Item data-testid="user-menu" size="sm" variant="outline" className="py-1.5">
				<ItemContent>
					<ItemTitle>{userName}</ItemTitle>
				</ItemContent>
				<ItemActions>
					<Button type="button" variant="outline" onClick={onLogout}>
						{LOGOUT_BUTTON_TEXT}
					</Button>
				</ItemActions>
			</Item>
			{error && <InlineError>{error}</InlineError>}
		</div>
	);
}
