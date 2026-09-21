import { convertToModelMessages, streamText, validateUIMessages } from "ai";
import { z } from "zod";
import { briefSchema } from "@/lib/brief";
import {
  GENERATION_SETTINGS,
  MAX_MESSAGES,
  buildSystemPrompt,
  chatModel,
} from "@/lib/ai/config";

// Must be a literal so Next.js can read it at build time.
export const maxDuration = 60;

const bodySchema = z.object({
  messages: z.array(z.unknown()).min(1).max(MAX_MESSAGES),
  brief: briefSchema,
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const messages = await validateUIMessages({ messages: parsed.data.messages });

  const result = streamText({
    model: chatModel,
    system: buildSystemPrompt(parsed.data.brief),
    messages: await convertToModelMessages(messages),
    // Stops the upstream Gemini call when the client aborts (Stop button).
    abortSignal: req.signal,
    ...GENERATION_SETTINGS,
  });

  return result.toUIMessageStreamResponse();
}