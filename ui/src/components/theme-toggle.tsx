import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import {
	THEME_TOGGLE_LABEL,
	THEME_TOGGLE_OPTION_DARK,
	THEME_TOGGLE_OPTION_LIGHT,
	THEME_TOGGLE_OPTION_SYSTEM,
} from "@/lib/content-strings";

export function ThemeToggle() {
	const { setTheme } = useTheme();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild data-testid="theme-toggle">
				<Button variant="outline" size="icon">
					<Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
					<Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
					<span className="sr-only">{THEME_TOGGLE_LABEL}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => setTheme("light")}>
					{THEME_TOGGLE_OPTION_LIGHT}
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("dark")}>
					{THEME_TOGGLE_OPTION_DARK}
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("system")}>
					{THEME_TOGGLE_OPTION_SYSTEM}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
