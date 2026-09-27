# FAE Capstone — Brand Compass

FlyRank Frontend AI Engineering capstone project. An AI-assisted brand identity tool: submit a brand brief, then refine the direction in a streaming chat with an AI brand strategist.

**Status:** Core streaming chat complete (FE-06). Generative UI / server-side tool complete (FE-07).

## Getting started

```bash
npm install
cp .env.example .env.local   # add your GEMINI_API_KEY (free at https://aistudio.google.com/apikey)
npm run dev
```

Open `http://localhost:3000/brief`, submit a brand brief, then click **Continue to your chat**.

> **The chat only works after a brief has been submitted.** The brief is what the AI grounds its advice in, and it's what tells `/results/[id]` which conversation to load. Visiting `/results/[id]` directly, without submitting a brief first, shows a "No brief found" message with a link back to the form. Each brief and its conversation are stored in your browser only, so refreshing keeps them but a different browser or device starts fresh.

## Streaming chat (FE-06)

- **Server:** `src/app/api/chat/route.ts` streams a Gemini reply via the AI SDK's `streamText`. Model and prompt config live in `src/lib/ai/config.ts`, a server-only module, so the API key never reaches the browser.
- **Client:** `src/components/StreamingChat.tsx` renders the conversation with `useChat`, a thinking indicator, a stop button that keeps the partial reply, auto-scroll that releases when you scroll up (with a "jump to latest" button), and streaming-safe markdown.
- **Persistence:** conversations are saved to `localStorage` per board, so a refresh doesn't lose the chat. A "Clear chat" button starts over.

## Generative UI / server-side tool (FE-07)

- **Tool:** `generateBrandDirection`, defined in `src/lib/ai/tools/generate-brand-direction.ts` and registered in `src/app/api/chat/route.ts`'s `streamText` call. The system prompt (`src/lib/ai/config.ts`) instructs the strategist to call it once a brand direction has been settled in conversation.
- **Input schema** (Zod, `brandDirectionInputSchema`):
  - `colorPalette`: array of 4–6 `{ hex, name, role }`, where `role` is one of `primary | secondary | accent | neutral | background`.
  - `typography`: array of `{ fontName, role, weight, usageNote }`, one `heading` entry and one `body` entry.
  - `logoDirections`: array of 2–3 short text descriptions of logo concepts.
  - `voiceAndTone`: `{ description, traits }` — a free-text paragraph plus a short list of trait words.
  - `brandPrinciples`: `{ description, principles }` — a free-text paragraph plus a short list of principle statements.
- **Execute / return shape:** validates the palette includes a `background`-role color (throwing if not), then computes the WCAG relative-luminance contrast ratio between each other color and the background. Returns:
```ts
  {
    board: BrandDirectionInput; // the original validated input, unchanged
    contrastReport: Array<{
      role: string;
      name: string;
      hex: string;
      ratio: number;      // rounded to 2 decimals
      passesAA: boolean;   // true if ratio >= 4.5
    }>;
  }
```
- **UI:** `src/components/BrandDirectionCard.tsx` renders all four tool part states surfaced by the AI SDK (`input-streaming`, `input-available`, `output-available`, `output-error`) with distinct visuals — loading indicators while the tool is being called, the full direction board with per-swatch contrast pass/fail badges on success, and a designed error card (rather than a crash) if `execute` throws — e.g. when a palette is missing a background color.

## Project docs

- [AGENTS.md](./AGENTS.md) — conventions and agent instructions
