import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RootError from "./error";
import BriefError from "./brief/error";
import ResultsError from "./results/[id]/error";
import BoardsError from "./boards/error";
import BoardsPage from "./boards/page";

describe("Error Boundaries", () => {
  const boundaries = [
    { name: "RootError", Component: RootError },
    { name: "BriefError", Component: BriefError },
    { name: "ResultsError", Component: ResultsError },
    { name: "BoardsError", Component: BoardsError },
  ];

  for (const { name, Component } of boundaries) {
    describe(name, () => {
      it("renders heading, body copy, calls reset on 'Try again' click, and links to home", () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        const resetMock = vi.fn();
        const testError = new Error("Sensitive database failure");

        render(<Component error={testError} reset={resetMock} />);

        // Should log error
        expect(consoleSpy).toHaveBeenCalledWith(testError);

        // Should not render error.message to the user
        expect(screen.queryByText(/Sensitive database failure/i)).not.toBeInTheDocument();

        // Should render font-heading title
        const heading = screen.getByRole("heading", { level: 1 });
        expect(heading).toHaveClass("font-heading");
        expect(heading).toHaveTextContent("Something went wrong");

        // Should render text-muted-foreground copy
        expect(screen.getByText(/An unexpected error occurred/i)).toHaveClass("text-muted-foreground");

        // Should render Try again button and call reset
        const tryAgainButton = screen.getByRole("button", { name: /try again/i });
        fireEvent.click(tryAgainButton);
        expect(resetMock).toHaveBeenCalledTimes(1);

        // Should render Go home link
        const goHomeLink = screen.getByRole("link", { name: /go home/i });
        expect(goHomeLink).toHaveAttribute("href", "/");

        consoleSpy.mockRestore();
      });
    });
  }
});

describe("BoardsPage empty state", () => {
  it("renders empty state heading, explanation, and link to /brief", () => {
    render(<BoardsPage />);

    // Shell
    const main = screen.getByRole("main");
    expect(main).toHaveClass("px-4", "py-12");

    // Short heading
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveClass("font-heading");
    expect(heading).toHaveTextContent(/no boards yet/i);

    // Explaining no boards exist
    expect(screen.getByText(/saved brand boards yet/i)).toBeInTheDocument();

    // Link with buttonVariants pointing to /brief
    const link = screen.getByRole("link", { name: /start a new brand brief/i });
    expect(link).toHaveAttribute("href", "/brief");
    expect(link).toHaveClass("bg-primary", "text-primary-foreground");
  });
});
