import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { Item, ItemActions, ItemContent, ItemTitle } from "@/components/ui/item/item";
import { useGlobalErrorStore } from "@/hooks/use-global-error-store";
import { authClient } from "@/lib/auth";
import {
	LOGIN_BUTTON_TEXT,
	LOGOUT_BUTTON_TEXT,
	LOGOUT_FAILED,
	NETWORK_ERROR,
} from "@/lib/content-strings";
import { Skeleton } from "@/components/ui/skeleton/skeleton";

export function UserMenu() {
	const navigate = useNavigate();
	const { data: sessionData, isPending } = authClient.useSession();
	const { setErrorMessage, clearErrorMessage } = useGlobalErrorStore();
	const userName = sessionData?.user?.name ?? null;

	async function onLogout() {
		clearErrorMessage();

		try {
			const { error: signOutError } = await authClient.signOut();

			if (signOutError) {
				const message = signOutError.message ?? LOGOUT_FAILED;
				setErrorMessage(message);
				return;
			}

			clearErrorMessage();
			navigate("/login", { replace: true, state: { loggedOut: true } });
		} catch {
			setErrorMessage(NETWORK_ERROR);
		}
	}

	if (isPending) {
		return (
			<div className="flex flex-col gap-2">
				<Item data-testid="user-menu" size="sm" variant="outline" className="py-1.5">
					<ItemContent>
						<ItemTitle>
							<Skeleton className="h-[22px] w-[100px]" />
						</ItemTitle>
					</ItemContent>
				</Item>
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
		</div>
	);
}
