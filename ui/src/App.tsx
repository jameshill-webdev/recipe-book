import { Routes, Route } from "react-router";
import { ThemeProvider } from "./components/theme-provider";
import { RequireAuth } from "./routes/RequireAuth";
import Home from "./routes/Home";
import Login from "./routes/login";
import SignUp from "./routes/SignUp";
import VerifyEmail from "./routes/VerifyEmail";
import ForgotPassword from "./routes/ForgotPassword";
import ResetPassword from "./routes/ResetPassword";
import Recipes from "./routes/Recipes";
import Ingredients from "./routes/Ingredients";
import NotFound from "./routes/NotFound";
import Navigation from "./components/navigation";
import EmailVerified from "./routes/EmailVerified";

function App() {
	return (
		<ThemeProvider defaultTheme="system" storageKey="recipebook-theme">
			<Navigation />
			<Routes>
				{/* public routes */}
				<Route path="/login" element={<Login />} />
				<Route path="/signup" element={<SignUp />} />
				<Route path="/verify-email" element={<VerifyEmail />} />
				<Route path="/email-verified" element={<EmailVerified />} />
				<Route path="/forgot-password" element={<ForgotPassword />} />
				<Route path="/reset-password" element={<ResetPassword />} />
				<Route path="*" element={<NotFound />} />

				{/* protected routes */}
				<Route element={<RequireAuth />}>
					<Route path="/" element={<Home />} />
					<Route path="/recipes" element={<Recipes />} />
					<Route path="/ingredients" element={<Ingredients />} />
				</Route>
			</Routes>
		</ThemeProvider>
	);
}

export default App;
