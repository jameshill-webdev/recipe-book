import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authClient } from "@/lib/auth";
import { GENERIC_LOADING } from "@/lib/content-strings";

export function RequireAuth() {
	const location = useLocation();
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		// TODO: replace with Skeleton or Spinner component
		return <div>{GENERIC_LOADING}</div>;
	}

	if (!session) {
		return <Navigate to="/login" replace state={{ from: location.pathname }} />;
	}

	return <Outlet />;
}
