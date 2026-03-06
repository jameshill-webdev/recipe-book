import { Outlet } from "react-router-dom";
import { GlobalAlertBanner } from "@/components/global-alert-banner";
import { Navigation } from "@/components/navigation";

export default function AppLayout() {
	return (
		<>
			<header>
				<Navigation />
			</header>
			<GlobalAlertBanner />
			<main>
				<Outlet />
			</main>
			<footer></footer>
		</>
	);
}
