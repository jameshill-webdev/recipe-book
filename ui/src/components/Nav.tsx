import { Link } from "react-router";

export default function Nav() {
    return (
        <nav style={{ display: "flex", gap: "1rem" }}>
            <Link to="/">Home</Link>
            <Link to="/recipes">Recipes</Link>
            <Link to="/ingredients">Ingredients</Link>
        </nav>
    );
}
