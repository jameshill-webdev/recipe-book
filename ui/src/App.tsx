import { Routes, Route } from "react-router";
import Nav from "./components/Nav";
import Home from "./routes/Home";
import Recipes from "./routes/Recipes";
import Ingredients from "./routes/Ingredients";
import NotFound from "./routes/NotFound";

function App() {
    return (
        <>
            <Nav />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/recipes" element={<Recipes />} />
                <Route path="/ingredients" element={<Ingredients />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
}

export default App;
