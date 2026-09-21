import { briefSchema, type Brief } from "@/lib/brief";

/**
 * Carries the submitted brief from the form to the results page.
 * Stored in localStorage (this browser only), keyed by board id.
 * Every access is guarded: storage can be blocked or empty.
 */
const storageKey = (boardId: string) => `brief:${boardId}`;

export function saveBrief(boardId: string, brief: Brief): void {
  try {
    localStorage.setItem(storageKey(boardId), JSON.stringify(brief));
  } catch {
    // Storage blocked or full: the results page will show its "no brief" state.
  }
}

/** Raw string snapshot, used with useSyncExternalStore (must be a stable primitive). */
export function readRawBrief(boardId: string): string | null {
  try {
    return localStorage.getItem(storageKey(boardId));
  } catch {
    return null;
  }
}

/** Re-validates stored data, since anything in localStorage is untrusted. */
export function parseBrief(raw: string | null): Brief | null {
  if (!raw) return null;
  try {
    const parsed = briefSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}