import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, it, expect } from "vitest";
import Login from "./index";

describe("Login", () => {
  it("renders text", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: "Log In" })).toBeInTheDocument();
  });
});