import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import StreamingChat from "./StreamingChat";
import type { Brief } from "@/lib/brief";

const mockUseChat = vi.fn();

// The AI route is never called: useChat is replaced, so no request can leave the test.
vi.mock("@ai-sdk/react", () => ({
  useChat: (...args: unknown[]) => mockUseChat(...args),
}));

const brief: Brief = {
  brandName: "Acme",
  industry: "Technology",
  description: "Modern developer tools for everyone",
  audience: "Software Engineers",
  goals: "Build delightful software",
  personalityTraits: ["modern", "minimal"],
  keywords: "fast clean reliable",
};

const userMessage = {
  id: "u1",
  role: "user" as const,
  parts: [{ type: "text" as const, text: "Suggest a palette" }],
};

function chatState(overrides: Record<string, unknown> = {}) {
  return {
    messages: [],
    setMessages: vi.fn(),
    sendMessage: vi.fn(),
    status: "ready",
    stop: vi.fn(),
    error: undefined,
    regenerate: vi.fn(),
    ...overrides,
  };
}

const toolBoard = {
  colorPalette: [
    { hex: "#0B3D91", name: "Compass Blue", role: "primary" },
    { hex: "#FFFFFF", name: "Paper White", role: "background" },
    { hex: "#F4D35E", name: "Signal Yellow", role: "accent" },
    { hex: "#222222", name: "Ink", role: "neutral" },
  ],
  typography: [
    { fontName: "Inter", role: "body", weight: "400 Regular", usageNote: "copy" },
    { fontName: "Space Grotesk", role: "heading", weight: "700 Bold", usageNote: "headlines" },
  ],
  logoDirections: ["A compass needle", "A north arrow"],
  voiceAndTone: { description: "Warm and clear.", traits: ["warm"] },
  brandPrinciples: { description: "Guiding ideas.", principles: ["Clarity first"] },
};

describe("StreamingChat message rendering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("pending (request sent, no reply yet)", () => {
    it("shows a thinking indicator, a Stop button and a busy log, and hides Send", () => {
      mockUseChat.mockReturnValue(chatState({ status: "submitted", messages: [userMessage] }));
      render(<StreamingChat brief={brief} boardId="b1" />);

      expect(screen.getByText("Suggest a palette")).toBeInTheDocument();
      expect(screen.getByRole("status", { name: "Assistant is thinking" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Stop generating" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Send message" })).not.toBeInTheDocument();
      expect(screen.getByRole("log")).toHaveAttribute("aria-busy", "true");
    });

    it("disables Clear chat while a reply is pending", () => {
      mockUseChat.mockReturnValue(chatState({ status: "submitted", messages: [userMessage] }));
      render(<StreamingChat brief={brief} boardId="b1" />);
      expect(screen.getByRole("button", { name: "Clear chat" })).toBeDisabled();
    });
  });

  describe("streaming (reply arriving)", () => {
    const streamingMessages = (text: string) => [
      userMessage,
      { id: "a1", role: "assistant" as const, parts: [{ type: "text" as const, text }] },
    ];

    it("shows the partial reply text and a working Stop button", () => {
      const stop = vi.fn();
      mockUseChat.mockReturnValue(
        chatState({ status: "streaming", stop, messages: streamingMessages("Try a deep blue") }),
      );
      render(<StreamingChat brief={brief} boardId="b1" />);

      expect(screen.getByText(/Try a deep blue/)).toBeInTheDocument();
      // The reply has begun, so the separate "pending" bubble is gone.
      expect(screen.queryByRole("status", { name: "Assistant is thinking" })).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Stop generating" }));
      expect(stop).toHaveBeenCalledTimes(1);
    });

    it("shows the thinking indicator inside the reply while its text is still empty", () => {
      mockUseChat.mockReturnValue(chatState({ status: "streaming", messages: streamingMessages("") }));
      render(<StreamingChat brief={brief} boardId="b1" />);
      expect(screen.getAllByRole("status", { name: "Assistant is thinking" })).toHaveLength(1);
    });
  });

  describe("message part types", () => {
    it("renders user text, assistant text and skips system messages", () => {
      mockUseChat.mockReturnValue(
        chatState({
          messages: [
            { id: "s1", role: "system", parts: [{ type: "text", text: "SECRET SYSTEM PROMPT" }] },
            userMessage,
            { id: "a1", role: "assistant", parts: [{ type: "text", text: "Go with a deep blue." }] },
          ],
        }),
      );
      render(<StreamingChat brief={brief} boardId="b1" />);

      expect(screen.getByText("Suggest a palette")).toBeInTheDocument();
      expect(screen.getByText(/Go with a deep blue\./)).toBeInTheDocument();
      expect(screen.queryByText("SECRET SYSTEM PROMPT")).not.toBeInTheDocument();
    });

    it("ignores part types the chat does not know how to render", () => {
      mockUseChat.mockReturnValue(
        chatState({
          messages: [
            {
              id: "a1",
              role: "assistant",
              parts: [
                { type: "reasoning", text: "hidden chain of thought" },
                { type: "text", text: "Visible answer" },
              ],
            },
          ],
        }),
      );
      render(<StreamingChat brief={brief} boardId="b1" />);
      expect(screen.getByText(/Visible answer/)).toBeInTheDocument();
      expect(screen.queryByText("hidden chain of thought")).not.toBeInTheDocument();
    });

    it("renders the tool part in its in-progress state inside the assistant bubble", () => {
      mockUseChat.mockReturnValue(
        chatState({
          status: "streaming",
          messages: [
            userMessage,
            {
              id: "a1",
              role: "assistant",
              parts: [
                { type: "tool-generateBrandDirection", toolCallId: "c1", state: "input-streaming", input: {} },
              ],
            },
          ],
        }),
      );
      render(<StreamingChat brief={brief} boardId="b1" />);
      expect(screen.getByText("Drafting the brand direction…")).toBeInTheDocument();
    });

    it("renders the finished direction board when the tool output is available", () => {
      mockUseChat.mockReturnValue(
        chatState({
          messages: [
            userMessage,
            {
              id: "a1",
              role: "assistant",
              parts: [
                {
                  type: "tool-generateBrandDirection",
                  toolCallId: "c1",
                  state: "output-available",
                  input: toolBoard,
                  output: {
                    board: toolBoard,
                    contrastReport: [
                      { role: "primary", name: "Compass Blue", hex: "#0B3D91", ratio: 9.7, passesAA: true },
                    ],
                  },
                },
              ],
            },
          ],
        }),
      );
      render(<StreamingChat brief={brief} boardId="b1" />);
      expect(screen.getByRole("heading", { level: 3, name: "Color palette" })).toBeInTheDocument();
      expect(screen.getByText("9.7:1")).toBeInTheDocument();
    });
  });

  describe("sending", () => {
    it("keeps Send disabled until there is text, then sends the trimmed message", () => {
      const sendMessage = vi.fn();
      mockUseChat.mockReturnValue(chatState({ sendMessage }));
      render(<StreamingChat brief={brief} boardId="b1" />);

      const send = screen.getByRole("button", { name: "Send message" });
      expect(send).toBeDisabled();

      fireEvent.change(screen.getByRole("textbox", { name: "Message" }), { target: { value: "  Warmer tone  " } });
      expect(send).toBeEnabled();

      fireEvent.click(send);
      expect(sendMessage).toHaveBeenCalledWith({ text: "Warmer tone" });
    });

    it("sends on Enter but adds a new line on Shift+Enter", () => {
      const sendMessage = vi.fn();
      mockUseChat.mockReturnValue(chatState({ sendMessage }));
      render(<StreamingChat brief={brief} boardId="b1" />);

      const box = screen.getByRole("textbox", { name: "Message" });
      fireEvent.change(box, { target: { value: "Hello" } });

      fireEvent.keyDown(box, { key: "Enter", shiftKey: true });
      expect(sendMessage).not.toHaveBeenCalled();

      fireEvent.keyDown(box, { key: "Enter" });
      expect(sendMessage).toHaveBeenCalledWith({ text: "Hello" });
    });
  });
});
