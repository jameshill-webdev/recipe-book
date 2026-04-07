import { Outlet } from "react-router-dom";
import { GlobalErrorAlert } from "@/components/global-error-alert/global-error-alert";
import { Navigation } from "@/components/navigation/navigation";

export default function AppLayout() {
	return (
		<>
			<header>
				<Navigation />
			</header>
			<GlobalErrorAlert />
			<main>
				<Outlet />
			</main>
			<footer></footer>
		</>
	);
}
