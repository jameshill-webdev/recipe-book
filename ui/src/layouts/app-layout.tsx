import { Outlet } from "react-router-dom";
import Navigation from "@/components/navigation";

export default function AppLayout() {
	return (
		<>
			<header>
				<Navigation />
			</header>
			<main className="mx-auto w-full max-w-5xl px-4 py-6">
				<Outlet />
			</main>
			<footer></footer>
		</>
	);
}
