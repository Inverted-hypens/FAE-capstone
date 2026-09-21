"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import StreamingChat from "@/components/StreamingChat";
import { parseBrief, readRawBrief } from "@/lib/brief-storage";

const subscribeToStorage = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};
const subscribeNever = () => () => {};

/** Loads the brief saved by the form, then mounts the chat once it exists. */
export default function ResultsChat({ boardId }: { boardId: string }) {
  // false on the server and during hydration, true afterwards: avoids a "no brief" flash.
  const isClient = useSyncExternalStore(subscribeNever, () => true, () => false);
  const raw = useSyncExternalStore(subscribeToStorage, () => readRawBrief(boardId), () => null);
  const brief = useMemo(() => parseBrief(raw), [raw]);

  if (!isClient) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (!brief) {
    return (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>No brief found for this board in this browser.</p>
        <Link href="/brief" className="font-medium text-primary underline-offset-4 hover:underline">
          Fill in a brand brief
        </Link>
      </div>
    );
  }

  return <StreamingChat key={boardId} brief={brief} />;
}