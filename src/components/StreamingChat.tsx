"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ArrowDown, ArrowUp, Square } from "lucide-react";
import { Streamdown } from "streamdown";
import { BrandDirectionToolPart } from "@/components/BrandDirectionCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MAX_MESSAGES } from "@/lib/chat-limits";
import { loadMessages, saveMessages } from "@/lib/chat-storage";
import { cn } from "@/lib/utils";
import type { Brief } from "@/lib/brief";

type ToolPart = Parameters<typeof BrandDirectionToolPart>[0]["part"];

/** Shown in the assistant bubble until the first token arrives. */
function ThinkingDots() {
  return (
    <span role="status" aria-label="Assistant is thinking" className="flex h-6 items-center gap-1">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          style={{ animationDelay: `${delay}ms` }}
          className="size-1.5 rounded-full bg-muted-foreground motion-safe:animate-pulse"
        />
      ))}
    </span>
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  return (
    <div className={cn("flex", role === "user" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed break-words",
          role === "user" ? "bg-primary whitespace-pre-wrap text-primary-foreground" : "bg-muted text-foreground",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default function StreamingChat({ brief, boardId }: { brief: Brief; boardId: string }) {
  // The brief rides along with every request; the server builds the system prompt from it.
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat", body: { brief } }),
    [brief],
  );
  // Only mounted client-side (see ResultsChat), so reading localStorage here is safe.
  const [initialMessages] = useState(() => loadMessages(boardId));
  const [truncated, setTruncated] = useState(false);
  const { messages, setMessages, sendMessage, status, stop, error, regenerate } = useChat({
    id: boardId,
    messages: initialMessages,
    transport,
    onFinish: ({ isAbort, isError, finishReason }) => {
      setTruncated(!isAbort && !isError && finishReason === undefined);
    },
  });

  const [input, setInput] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (status === "error" && error?.message === "rate_limit") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCooldown(10);
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
    setCooldown(0);
  }, [status, error]);
  const [showJump, setShowJump] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(true); // true = follow new tokens to the bottom
  const lastTopRef = useRef(0);

  const busy = status === "submitted" || status === "streaming";
  const atLimit = messages.length >= MAX_MESSAGES;
  const last = messages.at(-1);
  // Before the first assistant message exists, show a placeholder bubble.
  const showPending = busy && last?.role === "user";

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  // Save only between turns (not per token), so a refresh mid-reply restores the last complete state.
  useEffect(() => {
    if (status === "ready" && !truncated) saveMessages(boardId, messages);
  }, [boardId, messages, status, truncated]);

  // Follow the stream, but only while the user hasn't scrolled away.
  useEffect(() => {
    if (pinnedRef.current) scrollToBottom();
  }, [messages, status, scrollToBottom]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const scrolledUp = el.scrollTop < lastTopRef.current;
    lastTopRef.current = el.scrollTop;

    if (distanceFromBottom <= 8) {
      pinnedRef.current = true;
      setShowJump(false);
    } else if (scrolledUp) {
      // Release the pin the moment the user scrolls up.
      pinnedRef.current = false;
      setShowJump(true);
    }
  };

  const jumpToLatest = () => {
    pinnedRef.current = true;
    setShowJump(false);
    scrollToBottom();
  };

  const submit = () => {
    const text = input.trim();
    if (!text || busy || atLimit) return;
    pinnedRef.current = true; // sending a message always returns to the bottom
    setShowJump(false);
    setInput("");
    setTruncated(false);
    sendMessage({ text });
  };

  return (
    <section
      aria-label="Brand strategist chat"
      className="flex h-[calc(100dvh-14rem)] min-h-[26rem] w-full flex-col overflow-hidden rounded-2xl border border-border bg-card"
    >
      <div className="flex justify-end border-b border-border px-3 py-1.5">
        <Button
          variant="ghost"
          size="sm"
          disabled={busy || messages.length === 0}
          onClick={() => {
            setTruncated(false);
            setMessages([]);
          }}
        >
          Clear chat
        </Button>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          role="log"
          aria-busy={busy}
          className="h-full space-y-3 overflow-y-auto overscroll-contain px-4 py-4"
        >
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ask about colour, tone of voice or positioning for {brief.brandName}.
            </p>
          ) : null}

          {messages.map((message) => {
            const isLiveAssistant = busy && message.id === last?.id && message.role === "assistant";
            if (message.role === "system") return null;
            return (
              <Bubble key={message.id} role={message.role}>
                {message.parts.map((part, index) => {
                  if (part.type === "text") {
                    return isLiveAssistant && !part.text ? (
                      <ThinkingDots key={index} />
                    ) : (
                      <Streamdown key={index} isAnimating={isLiveAssistant} controls={false}>
                        {part.text}
                      </Streamdown>
                    );
                  }
                  if (part.type === "tool-generateBrandDirection") {
                    return <BrandDirectionToolPart key={index} part={part as unknown as ToolPart} />;
                  }
                  return null;
                })}
              </Bubble>
            );
          })}

          {showPending ? (
            <Bubble role="assistant">
              <ThinkingDots />
            </Bubble>
          ) : null}

          {status === "error" || truncated ? (
            <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <span>
                {status === "error"
                  ? error?.message === "rate_limit"
                    ? "You're sending messages too fast. Try again in a moment."
                    : "Something went wrong. Retry will resend your last message."
                  : "The reply was cut off. Retry will resend your last message."}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={cooldown > 0}
                onClick={() => {
                  setTruncated(false);
                  regenerate();
                }}
              >
                {cooldown > 0 ? `Retry (${cooldown}s)` : "Retry"}
              </Button>
            </div>
          ) : null}
        </div>

        {showJump ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={jumpToLatest}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 shadow-md"
          >
            <ArrowDown data-icon="inline-start" />
            Jump to latest
          </Button>
        ) : null}
      </div>

      {atLimit ? (
        <p role="note" className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
          This conversation has reached its length limit. Clear the chat to start a new one.
        </p>
      ) : null}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="flex items-end gap-2 border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <Textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            // Enter sends, Shift+Enter adds a line. Ignore Enter while an IME is composing.
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              submit();
            }
          }}
          rows={1}
          aria-label="Message"
          placeholder="Message the brand strategist"
          enterKeyHint="send"
          className="max-h-32 min-h-11 resize-none"
        />
        {/* One button, two jobs: send when idle, stop while generating. */}
        {busy ? (
          <Button type="button" onClick={() => stop()} aria-label="Stop generating" className="size-11 rounded-full">
            <Square className="fill-current" />
          </Button>
        ) : (
          <Button type="submit" disabled={!input.trim() || atLimit} aria-label="Send message" className="size-11 rounded-full">
            <ArrowUp />
          </Button>
        )}
      </form>
    </section>
  );
}