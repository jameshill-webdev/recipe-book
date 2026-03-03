import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authClient } from "@/lib/auth";

export function RequireAuth() {
	const location = useLocation();
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return <div>Loading…</div>;
	}

	if (!session) {
		return <Navigate to="/login" replace state={{ from: location.pathname }} />;
	}

	return <Outlet />;
}
