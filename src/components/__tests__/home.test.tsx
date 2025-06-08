import { render, screen } from "@testing-library/react";
import { Home } from "../home";

describe("Home", () => {
  it("renders the welcome headline", () => {
    render(<Home />);
    expect(screen.getByText("Welcome to Opsvision 3")).toBeInTheDocument();
  });

  it("renders the application description", () => {
    render(<Home />);

    const descriptions = screen.getAllByText(
      /This is an application|Opsvision 3 consists of/
    );
    expect(descriptions).toHaveLength(2);

    expect(descriptions[0]).toHaveTextContent(
      "This is an application that provides a way to share Key Performance Indicators (KPI) and Metrics with your organization via simple Dashboards."
    );

    expect(descriptions[1]).toHaveTextContent(
      "Opsvision 3 consists of a React6 single-page app (SPA), Auth0 for authentication and a corresponding Express server (API) application."
    );
  });

  it("applies the correct CSS classes", () => {
    render(<Home />);

    const container = screen.getByRole("heading", {
      name: /Welcome to Opsvision 3/i,
    }).parentElement;
    expect(container).toHaveClass("hero-banner", "hero-banner--aqua-emerald");

    const headline = screen.getByRole("heading", {
      name: /Welcome to Opsvision 3/i,
    });
    expect(headline).toHaveClass("hero-banner__headline");

    const descriptions = screen.getAllByText(
      /This is an application|Opsvision 3 consists of/
    );
    descriptions.forEach((description) => {
      expect(description).toHaveClass("hero-banner__description");
    });
  });
});
