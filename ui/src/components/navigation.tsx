import { Link } from "react-router";
import {
	NavigationMenu,
	NavigationMenuList,
	NavigationMenuItem,
	NavigationMenuLink,
	navigationMenuTriggerStyle,
} from "./ui/navigation-menu";
import { ThemeToggle } from "./theme-toggle";

export default function Navigation() {
	return (
		<div className="flex flex-row justify-between p-2">
			<NavigationMenu className="lg:justify-start">
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
			<ThemeToggle />
		</div>
	);
}
