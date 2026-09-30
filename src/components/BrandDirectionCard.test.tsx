import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BrandDirectionToolPart } from "./BrandDirectionCard";

type Part = Parameters<typeof BrandDirectionToolPart>[0]["part"];
type Input = Extract<Part, { state: "input-available" }>["input"];

const input: Input = {
  colorPalette: [
    { hex: "#0B3D91", name: "Compass Blue", role: "primary" },
    { hex: "#FFFFFF", name: "Paper White", role: "background" },
    { hex: "#F4D35E", name: "Signal Yellow", role: "accent" },
    { hex: "#222222", name: "Ink", role: "neutral" },
  ],
  typography: [
    { fontName: "Space Grotesk", role: "heading", weight: "700 Bold", usageNote: "headlines and CTAs" },
    { fontName: "Inter", role: "body", weight: "400 Regular", usageNote: "long-form copy" },
  ],
  logoDirections: ["A compass needle formed from the letter A", "A minimal north-pointing arrow"],
  voiceAndTone: { description: "Confident but warm.", traits: ["confident", "warm"] },
  brandPrinciples: {
    description: "Guiding ideas for every touchpoint.",
    principles: ["Clarity over cleverness", "Always show the way forward"],
  },
};

const base = { type: "tool-generateBrandDirection" as const, toolCallId: "call-1" };

const outputPart: Part = {
  ...base,
  state: "output-available",
  input,
  output: {
    board: input,
    contrastReport: [
      { role: "primary", name: "Compass Blue", hex: "#0B3D91", ratio: 9.7, passesAA: true },
      { role: "accent", name: "Signal Yellow", hex: "#F4D35E", ratio: 1.4, passesAA: false },
    ],
  },
};

describe("BrandDirectionToolPart", () => {
  it("shows a drafting message while the tool input is streaming", () => {
    render(<BrandDirectionToolPart part={{ ...base, state: "input-streaming", input: {} }} />);
    expect(screen.getByText("Drafting the brand direction…")).toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("shows a contrast-checking message once the input is complete but the result is not", () => {
    render(<BrandDirectionToolPart part={{ ...base, state: "input-available", input }} />);
    expect(screen.getByText("Checking palette contrast…")).toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("shows the error message when the tool fails", () => {
    render(
      <BrandDirectionToolPart
        part={{ ...base, state: "output-error", input, errorText: "Palette failed validation" }}
      />,
    );
    expect(screen.getByText("Couldn't finalize the direction")).toBeInTheDocument();
    expect(screen.getByText("Palette failed validation")).toBeInTheDocument();
  });

  it("renders every section of the board as a headed group when the output is available", () => {
    render(<BrandDirectionToolPart part={outputPart} />);
    for (const name of ["Color palette", "Typography", "Logo directions", "Voice & tone", "Brand principles"]) {
      expect(screen.getByRole("heading", { level: 3, name })).toBeInTheDocument();
    }
  });

  it("lists every logo direction and brand principle as list items", () => {
    render(<BrandDirectionToolPart part={outputPart} />);
    const lists = screen.getAllByRole("list");
    const items = lists.flatMap((list) => within(list).getAllByRole("listitem").map((li) => li.textContent));
    expect(items).toEqual([
      "A compass needle formed from the letter A",
      "A minimal north-pointing arrow",
      "Clarity over cleverness",
      "Always show the way forward",
    ]);
  });

  it("shows each palette colour's name, role and hex, and the typography pairing", () => {
    render(<BrandDirectionToolPart part={outputPart} />);
    expect(screen.getByText("Compass Blue · primary")).toBeInTheDocument();
    expect(screen.getByText("#F4D35E")).toBeInTheDocument();
    expect(screen.getByText(/Space Grotesk \(700 Bold\)/)).toBeInTheDocument();
    expect(screen.getByText(/Inter \(400 Regular\)/)).toBeInTheDocument();
  });

  it("shows a contrast ratio only for colours that appear in the contrast report", () => {
    render(<BrandDirectionToolPart part={outputPart} />);
    expect(screen.getByText("9.7:1")).toBeInTheDocument();
    expect(screen.getByText("1.4:1")).toBeInTheDocument();
    // "Ink" and "Paper White" have no report entry, so no badge is rendered for them.
    expect(screen.getAllByText(/:1$/)).toHaveLength(2);
  });

  it("states in text whether each colour passes WCAG AA contrast, not only through colour or an icon", () => {
    render(<BrandDirectionToolPart part={outputPart} />);
    expect(screen.getByText(/passes AA/i)).toBeInTheDocument();
    expect(screen.getByText(/fails AA/i)).toBeInTheDocument();
  });
});
