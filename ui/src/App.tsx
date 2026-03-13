import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/providers/theme-provider";
import { GlobalErrorProvider } from "@/providers/global-error-provider";
import { RequireAuth } from "@/routes/require-auth";
import AppLayout from "./layouts/app-layout";
import Home from "@/routes/home";
import Login from "@/routes/login";
import SignUp from "@/routes/sign-up";
import VerifyEmail from "@/routes/verify-email";
import ForgotPassword from "@/routes/forgot-password";
import ResetPassword from "@/routes/reset-password";
import Recipes from "@/routes/recipes";
import Ingredients from "@/routes/ingredients";
import NotFound from "@/routes/not-found";

function App() {
	return (
		<ThemeProvider defaultTheme="system" storageKey="recipebook-theme">
			<GlobalErrorProvider>
				<Routes>
					<Route element={<AppLayout />}>
						{/* public routes */}
						<Route path="/login" element={<Login />} />
						<Route path="/signup" element={<SignUp />} />
						<Route path="/verify-email" element={<VerifyEmail />} />
						<Route path="/forgot-password" element={<ForgotPassword />} />
						<Route path="/reset-password" element={<ResetPassword />} />
						<Route path="*" element={<NotFound />} />

						{/* protected routes */}
						<Route element={<RequireAuth />}>
							<Route index path="/" element={<Home />} />
							<Route path="/recipes" element={<Recipes />} />
							<Route path="/ingredients" element={<Ingredients />} />
						</Route>
					</Route>
				</Routes>
			</GlobalErrorProvider>
		</ThemeProvider>
	);
}

export default App;
