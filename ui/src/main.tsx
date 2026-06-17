import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@/index.css";
import App from "@/App.tsx";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: (failureCount, error) => {
				// Don't retry on client errors (4xx)
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const status = (error as any)?.status;
				if (status && status >= 400 && status < 500) {
					return false;
				}
				// Retry on server errors, max 1 retry
				return failureCount < 1;
			},
		},
	},
});

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</QueryClientProvider>
	</StrictMode>,
);
