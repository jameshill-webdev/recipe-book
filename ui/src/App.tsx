import { Routes, Route } from "react-router";
import { ThemeProvider } from "./components/theme-provider";
import Navigation from "./components/navigation";
import Home from "./routes/Home";
import Recipes from "./routes/Recipes";
import Ingredients from "./routes/Ingredients";
import NotFound from "./routes/NotFound";

function App() {
	return (
		<ThemeProvider defaultTheme="system" storageKey="recipebook-theme">
			<Navigation />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/recipes" element={<Recipes />} />
				<Route path="/ingredients" element={<Ingredients />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</ThemeProvider>
	);
}

export default App;
