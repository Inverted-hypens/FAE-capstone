import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  validateUIMessages,
} from "ai";
import { z } from "zod";
import { briefSchema } from "@/lib/brief";
import { getChatErrorCode } from "@/lib/chat-errors";
import { MAX_MESSAGES } from "@/lib/chat-limits";
import {
  GENERATION_SETTINGS,
  buildSystemPrompt,
  chatModel,
} from "@/lib/ai/config";
import { generateBrandDirection } from "@/lib/ai/tools/generate-brand-direction";

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

  let messages;
  try {
    messages = await validateUIMessages({ messages: parsed.data.messages });
  } catch {
    return Response.json({ error: "Invalid messages" }, { status: 400 });
  }

  const result = streamText({
    model: chatModel,
    system: buildSystemPrompt(parsed.data.brief),
    messages: await convertToModelMessages(messages),
    tools: { generateBrandDirection },
    stopWhen: stepCountIs(2),
    // Stops the upstream Gemini call when the client aborts (Stop button).
    abortSignal: req.signal,
    ...GENERATION_SETTINGS,
  });

  return result.toUIMessageStreamResponse({
    onError: (error) => {
      console.error("[chat]", error);
      return getChatErrorCode(error);
    },
  });
}