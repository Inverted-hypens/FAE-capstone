"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const personalityTraits = ["modern", "friendly", "premium", "bold", "playful", "minimal"] as const;

const formSchema = z.object({
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

type FormValues = z.infer<typeof formSchema>;

export default function BrandBriefForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const firstErrorRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLFieldSetElement | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    clearErrors,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brandName: "",
      industry: "",
      description: "",
      audience: "",
      goals: "",
      competitors: "",
      personalityTraits: [],
      keywords: "",
      colors: "",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const descriptionValue = watch("description") ?? "";
  const keywordsValue = watch("keywords") ?? "";
  const selectedTraits = watch("personalityTraits") ?? [];

  const descriptionCount = descriptionValue.length;
  const keywordCount = keywordsValue.split(/\s+/).filter(Boolean).length;

  useEffect(() => {
    if (errors.brandName) {
      firstErrorRef.current = document.getElementById("brandName") as HTMLInputElement | null;
      firstErrorRef.current?.focus();
      return;
    }
    if (errors.industry) {
      firstErrorRef.current = document.getElementById("industry") as HTMLInputElement | null;
      firstErrorRef.current?.focus();
      return;
    }
    if (errors.description) {
      firstErrorRef.current = document.getElementById("description") as HTMLTextAreaElement | null;
      firstErrorRef.current?.focus();
      return;
    }
    if (errors.audience) {
      firstErrorRef.current = document.getElementById("audience") as HTMLInputElement | null;
      firstErrorRef.current?.focus();
      return;
    }
    if (errors.goals) {
      firstErrorRef.current = document.getElementById("goals") as HTMLTextAreaElement | null;
      firstErrorRef.current?.focus();
      return;
    }
    if (errors.personalityTraits) {
      firstErrorRef.current = document.getElementById("personality-traits") as HTMLFieldSetElement | null;
      firstErrorRef.current?.focus();
      return;
    }
    if (errors.keywords) {
      firstErrorRef.current = document.getElementById("keywords") as HTMLInputElement | null;
      firstErrorRef.current?.focus();
      return;
    }
  }, [errors]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setIsSuccess(false);
    clearErrors();

    const parsed = formSchema.safeParse(values);
    if (!parsed.success) {
      setIsSubmitting(false);
      return;
    }

    console.log("Brand brief data:", parsed.data);
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const toggleTrait = (trait: (typeof personalityTraits)[number]) => {
    const next = selectedTraits.includes(trait)
      ? selectedTraits.filter((item) => item !== trait)
      : [...selectedTraits, trait];
    setValue("personalityTraits", next, { shouldValidate: true, shouldDirty: true });
  };

  const getErrorId = (field: keyof FormValues) => `${field}-error`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm" noValidate>
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">Brand brief</p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">Create a concise brand brief</h1>
        <p className="text-sm text-zinc-600">Shape your brand story with the essentials before you start the AI workflow.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="brandName">Brand name</Label>
          <Input id="brandName" {...register("brandName")} aria-invalid={Boolean(errors.brandName)} aria-describedby={errors.brandName ? getErrorId("brandName") : undefined} />
          {errors.brandName ? <p id={getErrorId("brandName")} role="alert" className="text-sm text-red-600">{errors.brandName.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry/niche</Label>
          <Input id="industry" {...register("industry")} aria-invalid={Boolean(errors.industry)} aria-describedby={errors.industry ? getErrorId("industry") : undefined} />
          {errors.industry ? <p id={getErrorId("industry")} role="alert" className="text-sm text-red-600">{errors.industry.message}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">One-sentence description</Label>
        <Textarea id="description" {...register("description")} maxLength={150} aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? `${getErrorId("description")} description-count` : "description-count"} />
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">Describe the brand in one sentence.</span>
          <span id="description-count" className={descriptionCount > 150 ? "text-red-600" : "text-zinc-500"}>{descriptionCount}/150</span>
        </div>
        {errors.description ? <p id={getErrorId("description")} role="alert" className="text-sm text-red-600">{errors.description.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="audience">Target audience</Label>
        <Input id="audience" {...register("audience")} aria-invalid={Boolean(errors.audience)} aria-describedby={errors.audience ? getErrorId("audience") : undefined} />
        {errors.audience ? <p id={getErrorId("audience")} role="alert" className="text-sm text-red-600">{errors.audience.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="goals">Brand goals</Label>
        <Textarea id="goals" {...register("goals")} maxLength={150} aria-invalid={Boolean(errors.goals)} aria-describedby={errors.goals ? getErrorId("goals") : undefined} />
        {errors.goals ? <p id={getErrorId("goals")} role="alert" className="text-sm text-red-600">{errors.goals.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="competitors">Competitors</Label>
        <Input id="competitors" {...register("competitors")} aria-invalid={Boolean(errors.competitors)} aria-describedby={errors.competitors ? getErrorId("competitors") : undefined} />
        {errors.competitors ? <p id={getErrorId("competitors")} role="alert" className="text-sm text-red-600">{errors.competitors.message}</p> : null}
      </div>

      <div className="space-y-3">
        <fieldset id="personality-traits" tabIndex={-1} className="space-y-3" aria-invalid={Boolean(errors.personalityTraits)} aria-describedby={errors.personalityTraits ? getErrorId("personalityTraits") : undefined}>
          <legend className="text-sm font-medium text-zinc-900">Personality traits</legend>
          <div className="flex flex-wrap gap-2">
            {personalityTraits.map((trait) => {
              const checked = selectedTraits.includes(trait);
              return (
                <label key={trait} className={`flex cursor-pointer items-center rounded-full border px-3 py-2 text-sm transition ${checked ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-300 bg-white text-zinc-700"}`}>
                  <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleTrait(trait)} />
                  <span>{trait}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
        {errors.personalityTraits ? <p id={getErrorId("personalityTraits")} role="alert" className="text-sm text-red-600">{errors.personalityTraits.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="keywords">Keywords</Label>
        <Input id="keywords" {...register("keywords")} placeholder="3 words that make you different, not just modern/bold/etc." aria-invalid={Boolean(errors.keywords)} aria-describedby={errors.keywords ? `${getErrorId("keywords")} keywords-helper` : "keywords-helper"} />
        <p id="keywords-helper" className="text-sm text-zinc-500">Avoid repeating your personality traits here — aim for something more specific to your brand.</p>
        <p className="text-sm text-zinc-500">{keywordCount}/3 keywords</p>
        {errors.keywords ? <p id={getErrorId("keywords")} role="alert" className="text-sm text-red-600">{errors.keywords.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="colors">Colors you like/dislike</Label>
        <Input id="colors" {...register("colors")} aria-invalid={Boolean(errors.colors)} aria-describedby={errors.colors ? getErrorId("colors") : undefined} />
        {errors.colors ? <p id={getErrorId("colors")} role="alert" className="text-sm text-red-600">{errors.colors.message}</p> : null}
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-zinc-200 pt-4">
        <div className="text-sm text-zinc-600">
          {isSuccess ? <span className="font-medium text-green-600">Brand brief submitted successfully.</span> : null}
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit brand brief"}
        </Button>
      </div>
    </form>
  );
}
