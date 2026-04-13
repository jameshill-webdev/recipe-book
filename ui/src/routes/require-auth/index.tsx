import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authClient } from "@/lib/auth";
import { LoadingSpinner } from "@/components/loading-spinner/loading-spinner";

export function RequireAuth() {
	const location = useLocation();
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return (
			<div>
				<LoadingSpinner />
			</div>
		);
	}

	if (!session) {
		return (
			<Navigate
				to="/login"
				replace
				state={{
					from: location.pathname,
					...(location.state || {}),
				}}
			/>
		);
	}

	return <Outlet />;
}
