import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { LeftNav } from "./left-nav";

// Test wrapper component that provides router context
const TestWrapper: React.FC<{
  children: React.ReactNode;
  initialRoute?: string;
}> = ({ children, initialRoute = "/" }) => {
  return (
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="*" element={<>{children}</>} />
      </Routes>
    </MemoryRouter>
  );
};

describe("LeftNav", () => {
  it("renders all navigation items", () => {
    render(
      <TestWrapper>
        <LeftNav />
      </TestWrapper>
    );

    // Check if all navigation items are rendered
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Public")).toBeInTheDocument();
    expect(screen.getByText("Protected")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Admin Features")).toBeInTheDocument();
  });

  it("renders navigation links with correct paths", () => {
    render(
      <TestWrapper>
        <LeftNav />
      </TestWrapper>
    );

    // Check if links have correct href attributes
    expect(screen.getByText("Home").closest("a")).toHaveAttribute("href", "/");
    expect(screen.getByText("Profile").closest("a")).toHaveAttribute(
      "href",
      "/profile"
    );
    expect(screen.getByText("Public").closest("a")).toHaveAttribute(
      "href",
      "/public"
    );
    expect(screen.getByText("Protected").closest("a")).toHaveAttribute(
      "href",
      "/protected"
    );
    expect(screen.getByText("Admin").closest("a")).toHaveAttribute(
      "href",
      "/admin"
    );
    expect(screen.getByText("Admin Features").closest("a")).toHaveAttribute(
      "href",
      "/admin-features"
    );
  });

  it("applies active class to current route", () => {
    render(
      <TestWrapper initialRoute="/profile">
        <LeftNav />
      </TestWrapper>
    );

    // Check if the Profile link has the active class
    const profileLink = screen.getByText("Profile").closest("a");
    expect(profileLink).toHaveClass("active");

    // Check that other links don't have the active class
    const homeLink = screen.getByText("Home").closest("a");
    expect(homeLink).not.toHaveClass("active");
  });
});
