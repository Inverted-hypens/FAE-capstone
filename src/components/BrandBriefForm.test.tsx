import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import BrandBriefForm from "./BrandBriefForm";

describe("BrandBriefForm", () => {
  it("shows validation errors for empty submit and focuses the first invalid field", async () => {
    render(<BrandBriefForm />);

    fireEvent.click(screen.getByRole("button", { name: /submit brand brief/i }));

    expect(await screen.findByText(/brand name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/industry\/niche is required/i)).toBeInTheDocument();
    expect(screen.getByText(/one-sentence description is required/i)).toBeInTheDocument();
    expect(screen.getByText(/target audience is required/i)).toBeInTheDocument();
    expect(screen.getByText(/brand goals are required/i)).toBeInTheDocument();
    expect(screen.getByText(/pick at least 1 trait/i)).toBeInTheDocument();
    expect(screen.getByText(/enter exactly 3 keywords/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/brand name/i)).toHaveFocus();
  });

  it("blocks submission when description exceeds max length", async () => {
    render(<BrandBriefForm />);

    fireEvent.change(screen.getByLabelText(/one-sentence description/i), {
      target: { value: "a".repeat(151) },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit brand brief/i }));

    expect(await screen.findByText(/description must be 150 characters or less/i)).toBeInTheDocument();
  });

  it("shows an error when zero personality traits are selected", async () => {
    render(<BrandBriefForm />);

    fireEvent.click(screen.getByRole("button", { name: /submit brand brief/i }));

    const error = await screen.findByText(/pick at least 1 trait/i);
    expect(error).toBeInTheDocument();
    expect(screen.getByRole("group", { name: /personality traits/i })).toHaveAttribute("aria-invalid", "true");
  });

  it("shows an error when more than four personality traits are selected", async () => {
    render(<BrandBriefForm />);

    const options = screen.getAllByRole("checkbox");
    for (const option of options) {
      fireEvent.click(option);
    }

    fireEvent.click(screen.getByRole("button", { name: /submit brand brief/i }));

    expect(await screen.findByText(/pick between 1 and 4 traits/i)).toBeInTheDocument();
  });

  it("shows an error when keyword count is not exactly three", async () => {
    render(<BrandBriefForm />);

    fireEvent.change(screen.getByLabelText(/brand name/i), { target: { value: "Northstar" } });
    fireEvent.change(screen.getByLabelText(/industry\/niche/i), { target: { value: "Wellness" } });
    fireEvent.change(screen.getByLabelText(/one-sentence description/i), { target: { value: "A thoughtful brand for calm modern living." } });
    fireEvent.change(screen.getByLabelText(/target audience/i), { target: { value: "Young professionals" } });
    fireEvent.change(screen.getByLabelText(/brand goals/i), { target: { value: "Build trust and loyalty" } });
    fireEvent.click(screen.getByRole("checkbox", { name: /modern/i }));

    fireEvent.change(screen.getByLabelText(/keywords/i), { target: { value: "calm focus" } });
    fireEvent.click(screen.getByRole("button", { name: /submit brand brief/i }));

    expect(await screen.findByText(/enter exactly 3 keywords/i)).toBeInTheDocument();
  });

  it("submits successfully and logs parsed data for a valid form", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    render(<BrandBriefForm />);

    fireEvent.change(screen.getByLabelText(/brand name/i), { target: { value: "Northstar" } });
    fireEvent.change(screen.getByLabelText(/industry\/niche/i), { target: { value: "Wellness" } });
    fireEvent.change(screen.getByLabelText(/one-sentence description/i), { target: { value: "A thoughtful brand for calm modern living." } });
    fireEvent.change(screen.getByLabelText(/target audience/i), { target: { value: "Young professionals" } });
    fireEvent.change(screen.getByLabelText(/brand goals/i), { target: { value: "Build trust and loyalty" } });
    fireEvent.click(screen.getByRole("checkbox", { name: /modern/i }));
    fireEvent.click(screen.getByRole("checkbox", { name: /friendly/i }));
    fireEvent.change(screen.getByLabelText(/keywords/i), { target: { value: "calm focus clarity" } });

    fireEvent.click(screen.getByRole("button", { name: /submit brand brief/i }));

    await waitFor(() => expect(consoleSpy).toHaveBeenCalled());
    expect(screen.getByText(/brand brief submitted successfully/i)).toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});
