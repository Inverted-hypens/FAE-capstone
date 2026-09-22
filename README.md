# FAE Capstone — Brand Compass

FlyRank Frontend AI Engineering capstone project. An AI-assisted brand identity tool: submit a brand brief, then refine the direction in a streaming chat with an AI brand strategist.

**Status:** Core streaming chat complete (FE-06).

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

## Project docs

- [AGENTS.md](./AGENTS.md) — conventions and agent instructions
