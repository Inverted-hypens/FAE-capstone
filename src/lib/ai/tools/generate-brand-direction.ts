import { tool } from "ai";
import { z } from "zod";

const colorEntrySchema = z.object({
  hex: z.string().describe("Hex color code, e.g. #1A1A1A"),
  name: z.string().describe("Descriptive name, e.g. 'Charcoal'"),
  role: z.enum(["primary", "secondary", "accent", "neutral", "background"]),
});

export const brandDirectionInputSchema = z.object({
  colorPalette: z
    .array(colorEntrySchema)
    .min(4)
    .max(6)
    .describe("The brand's color palette, 4-6 colors, each with a distinct role"),
  typography: z
    .array(
      z.object({
        fontName: z.string().describe("Font family name, e.g. 'Inter'"),
        role: z.enum(["heading", "body"]),
        weight: z.string().describe("Suggested weight, e.g. '700 Bold'"),
        usageNote: z.string().describe("Where/how this is used, e.g. 'headlines and CTAs'"),
      })
    )
    .describe("Font pairing, one heading + one body entry"),
  logoDirections: z
    .array(z.string().describe("A short text description of one logo direction"))
    .min(2)
    .max(3)
    .describe("2-3 logo direction concepts as text descriptions"),
  voiceAndTone: z.object({
    description: z.string().describe("Free-text paragraph describing the brand's voice and tone"),
    traits: z.array(z.string()).describe("Short list of voice traits, e.g. 'confident', 'warm'"),
  }),
  brandPrinciples: z.object({
    description: z.string().describe("Free-text paragraph on the brand's guiding principles"),
    principles: z.array(z.string()).describe("Short list of individual principle statements"),
  }),
});

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const channel = c / 255;
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hexA: string, hexB: string) {
  const lumA = relativeLuminance(hexToRgb(hexA));
  const lumB = relativeLuminance(hexToRgb(hexB));
  const [lighter, darker] = lumA > lumB ? [lumA, lumB] : [lumB, lumA];
  return (lighter + 0.05) / (darker + 0.05);
}

export const generateBrandDirection = tool({
  description:
    "Finalizes a brand direction board (palette, typography, logo directions, voice, principles) and validates the color palette for WCAG AA contrast against the background color.",
  inputSchema: brandDirectionInputSchema,
  execute: async (input) => {
    const background = input.colorPalette.find((c) => c.role === "background");
    if (!background) {
      throw new Error("Palette must include a 'background' color to validate contrast.");
    }
    const contrastReport = input.colorPalette
      .filter((c) => c.role !== "background")
      .map((c) => {
        const ratio = contrastRatio(c.hex, background!.hex);
        return { role: c.role, name: c.name, hex: c.hex, ratio: Math.round(ratio * 100) / 100, passesAA: ratio >= 4.5 };
      });
    return { board: input, contrastReport };
  },
});
