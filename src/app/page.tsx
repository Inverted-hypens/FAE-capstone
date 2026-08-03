"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";

type BrandBriefForm = {
  brandName: string;
  objective: string;
  audience: string;
  tone: string;
  differentiators: string;
  channels: string;
  deadline: string;
};

const initialForm: BrandBriefForm = {
  brandName: "",
  objective: "",
  audience: "",
  tone: "Confident",
  differentiators: "",
  channels: "",
  deadline: "",
};

export default function Home() {
  const [form, setForm] = useState<BrandBriefForm>(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.15),_transparent_35%),linear-gradient(135deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="max-w-2xl space-y-3">
          <span className="inline-flex w-fit items-center rounded-full border border-indigo-200 bg-white/80 px-3 py-1 text-sm font-medium text-indigo-700 shadow-sm">
            Brand brief builder
          </span>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Shape the story behind your next launch
          </h1>
          <p className="text-lg leading-8 text-slate-600">
            Capture the strategy, audience, and voice in one place so your team can move faster.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.25)] sm:p-8"
          >
            <div className="grid gap-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="brandName">
                  Brand name
                </label>
                <input
                  id="brandName"
                  name="brandName"
                  value={form.brandName}
                  onChange={handleChange}
                  placeholder="Northstar Studio"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="objective">
                  Core objective
                </label>
                <textarea
                  id="objective"
                  name="objective"
                  value={form.objective}
                  onChange={handleChange}
                  rows={4}
                  placeholder="What should this brand achieve in the market?"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="audience">
                  Target audience
                </label>
                <input
                  id="audience"
                  name="audience"
                  value={form.audience}
                  onChange={handleChange}
                  placeholder="Design-led founders in SaaS"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="tone">
                    Brand tone
                  </label>
                  <select
                    id="tone"
                    name="tone"
                    value={form.tone}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-white"
                  >
                    <option>Confident</option>
                    <option>Warm</option>
                    <option>Playful</option>
                    <option>Minimal</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="deadline">
                    Launch deadline
                  </label>
                  <input
                    id="deadline"
                    name="deadline"
                    type="date"
                    value={form.deadline}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="differentiators">
                  Key differentiators
                </label>
                <textarea
                  id="differentiators"
                  name="differentiators"
                  value={form.differentiators}
                  onChange={handleChange}
                  rows={3}
                  placeholder="What makes this brand stand out?"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="channels">
                  Priority channels
                </label>
                <input
                  id="channels"
                  name="channels"
                  value={form.channels}
                  onChange={handleChange}
                  placeholder="Instagram, LinkedIn, paid search"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-8 inline-flex items-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Save brand brief
            </button>
          </form>

          <aside className="rounded-3xl border border-indigo-100 bg-slate-950 p-6 text-white shadow-[0_20px_60px_-20px_rgba(15,23,42,0.45)] sm:p-8">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.3em] text-indigo-300">
                  Live preview
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {form.brandName || "Your brand brief"}
                </h2>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-sm text-slate-300">Objective</p>
                <p className="mt-2 text-sm leading-7 text-slate-100">
                  {form.objective || "Describe the core purpose of the brand here."}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-sm text-slate-300">Audience</p>
                  <p className="mt-2 text-sm text-slate-100">{form.audience || "Who you are speaking to"}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-sm text-slate-300">Tone</p>
                  <p className="mt-2 text-sm text-slate-100">{form.tone}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-sm text-slate-300">Differentiators</p>
                <p className="mt-2 text-sm leading-7 text-slate-100">
                  {form.differentiators || "Highlight the factors that set the brand apart."}
                </p>
              </div>

              {submitted ? (
                <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/15 p-4 text-sm text-emerald-200">
                  Your brand brief is ready to share with the team.
                </div>
              ) : (
                <p className="text-sm leading-7 text-slate-400">
                  Fill in the fields and save your brief to keep the strategy aligned.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
