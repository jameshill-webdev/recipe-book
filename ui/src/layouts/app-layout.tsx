import { Outlet } from "react-router-dom";
import { Navigation } from "@/components/navigation";

export default function AppLayout() {
	return (
		<>
			<header>
				<Navigation />
			</header>
			<main>
				<Outlet />
			</main>
			<footer></footer>
		</>
	);
}
