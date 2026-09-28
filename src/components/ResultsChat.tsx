"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import StreamingChat from "@/components/StreamingChat";
import { buttonVariants } from "@/components/ui/button";
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
    return (
      <div
        role="status"
        aria-label="Loading chat"
        className="flex h-[calc(100dvh-14rem)] min-h-[26rem] w-full flex-col overflow-hidden rounded-2xl border border-border bg-card animate-pulse"
      >
        <span className="sr-only">Loading…</span>
        <div className="flex justify-end border-b border-border px-3 py-1.5">
          <div className="h-8 w-20 rounded-md bg-muted" />
        </div>
        <div className="flex-1 space-y-4 p-4">
          <div className="flex justify-end">
            <div className="h-10 w-2/5 rounded-2xl bg-muted" />
          </div>
          <div className="flex justify-start">
            <div className="h-20 w-3/4 rounded-2xl bg-muted" />
          </div>
          <div className="flex justify-start">
            <div className="h-12 w-1/2 rounded-2xl bg-muted" />
          </div>
        </div>
        <div className="flex items-end gap-2 border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="h-11 flex-1 rounded-lg bg-muted" />
          <div className="size-11 shrink-0 rounded-full bg-muted" />
        </div>
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-8 text-center space-y-4">
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          No brief found
        </h2>
        <p className="text-muted-foreground">
          No brief found for this board in this browser.
        </p>
        <div className="pt-2">
          <Link href="/brief" className={buttonVariants({ variant: "default" })}>
            Fill in a brand brief
          </Link>
        </div>
      </div>
    );
  }

  return <StreamingChat key={boardId} brief={brief} boardId={boardId} />;
}