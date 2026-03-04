import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	NavigationMenu,
	NavigationMenuList,
	NavigationMenuItem,
	NavigationMenuLink,
	navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { InlineError } from "@/components/ui/error";
import { authClient } from "@/lib/auth";
import { LOGOUT_FAILED, NETWORK_ERROR } from "@/lib/messages";

export default function Navigation() {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();
	const [error, setError] = useState<string | null>(null);

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

	return (
		<div className="flex flex-col gap-2 p-2">
			<div className="flex flex-row justify-between">
				<NavigationMenu className="mx-auto max-w-5xl px-4 lg:justify-start">
					<NavigationMenuList>
						<NavigationMenuItem>
							<NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
								<Link to="/">Home</Link>
							</NavigationMenuLink>
						</NavigationMenuItem>
						<NavigationMenuItem>
							<NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
								<Link to="/ingredients">Ingredients</Link>
							</NavigationMenuLink>
						</NavigationMenuItem>
						<NavigationMenuItem>
							<NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
								<Link to="/recipes">Recipes</Link>
							</NavigationMenuLink>
						</NavigationMenuItem>
					</NavigationMenuList>
				</NavigationMenu>
				<div className="flex items-center gap-2">
					{session && !isPending && (
						<Button type="button" variant="outline" onClick={onLogout}>
							Log out
						</Button>
					)}
					<ThemeToggle />
				</div>
			</div>
			{error && <InlineError>{error}</InlineError>}
		</div>
	);
}
