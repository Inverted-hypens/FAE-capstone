import { z } from "zod";
import type { UIMessage } from "ai";

/**
 * Persists a board's conversation in localStorage so a refresh isn't data loss.
 * Same pattern as brief-storage: every access is guarded, stored data is re-validated.
 */
const storageKey = (boardId: string) => `chat:${boardId}`;

const storedMessagesSchema = z.array(
  z.object({
    id: z.string(),
    role: z.enum(["user", "assistant", "system"]),
    parts: z.array(z.object({ type: z.string() }).passthrough()),
  }),
);

export function loadMessages(boardId: string): UIMessage[] {
  try {
    const raw = localStorage.getItem(storageKey(boardId));
    if (!raw) return [];
    const parsed = storedMessagesSchema.safeParse(JSON.parse(raw));
    return parsed.success ? (parsed.data as UIMessage[]) : [];
  } catch {
    return [];
  }
}

export function saveMessages(boardId: string, messages: UIMessage[]): void {
  try {
    if (messages.length === 0) localStorage.removeItem(storageKey(boardId));
    else localStorage.setItem(storageKey(boardId), JSON.stringify(messages));
  } catch {
    // Storage blocked or full: the chat still works, it just won't survive a refresh.
  }
}