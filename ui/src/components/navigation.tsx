import { Link } from "react-router-dom";
import {
	NavigationMenu,
	NavigationMenuList,
	NavigationMenuItem,
	NavigationMenuLink,
	navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import {
	NAVIGATION_LINK_TEXT_HOME,
	NAVIGATION_LINK_TEXT_INGREDIENTS,
	NAVIGATION_LINK_TEXT_RECIPES,
} from "@/lib/messages";

export function Navigation() {
	return (
		<div className="flex flex-row justify-between p-2">
			<NavigationMenu className="mx-auto max-w-5xl px-4 lg:justify-start">
				<NavigationMenuList>
					<NavigationMenuItem>
						<NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
							<Link to="/">{NAVIGATION_LINK_TEXT_HOME}</Link>
						</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
							<Link to="/ingredients">{NAVIGATION_LINK_TEXT_INGREDIENTS}</Link>
						</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
							<Link to="/recipes">{NAVIGATION_LINK_TEXT_RECIPES}</Link>
						</NavigationMenuLink>
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenu>
			<div className="flex items-center gap-2">
				<UserMenu />
				<ThemeToggle />
			</div>
		</div>
	);
}
