import { z } from "zod";

export const personalityTraits = ["modern", "friendly", "premium", "bold", "playful", "minimal"] as const;

export const briefSchema = z.object({
  brandName: z.string().trim().min(2, "Brand name is required").max(50, "Brand name must be 50 characters or less"),
  industry: z.string().trim().min(2, "Industry/niche is required").max(40, "Industry/niche must be 40 characters or less"),
  description: z.string().trim().min(1, "One-sentence description is required").max(150, "Description must be 150 characters or less"),
  audience: z.string().trim().min(1, "Target audience is required").max(100, "Target audience must be 100 characters or less"),
  goals: z.string().trim().min(1, "Brand goals are required").max(150, "Brand goals must be 150 characters or less"),
  competitors: z.string().max(100, "Competitors must be 100 characters or less").optional().or(z.literal("")),
  personalityTraits: z.array(z.enum(personalityTraits)).min(1, "Pick at least 1 trait").max(4, "Pick between 1 and 4 traits"),
  keywords: z.string().trim().min(1, "Enter exactly 3 keywords").refine((value) => value.split(/\s+/).filter(Boolean).length === 3, "Enter exactly 3 keywords"),
  colors: z.string().max(100, "Colors must be 100 characters or less").optional().or(z.literal("")),
});

export type Brief = z.infer<typeof briefSchema>;