import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import StreamingChat from "./StreamingChat";
import type { Brief } from "@/lib/brief";

const mockUseChat = vi.fn();

vi.mock("@ai-sdk/react", () => ({
  useChat: (...args: unknown[]) => mockUseChat(...args),
}));

const mockBrief: Brief = {
  brandName: "Acme",
  industry: "Technology",
  description: "Modern developer tools for everyone",
  audience: "Software Engineers",
  goals: "Build delightful software",
  personalityTraits: ["modern", "minimal"],
  keywords: "fast clean reliable",
};

describe("StreamingChat error state", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles rate_limit error by showing rate limit copy and a disabled button with countdown label", () => {
    const regenerateMock = vi.fn();

    mockUseChat.mockReturnValue({
      messages: [],
      setMessages: vi.fn(),
      sendMessage: vi.fn(),
      status: "error",
      stop: vi.fn(),
      error: new Error("rate_limit"),
      regenerate: regenerateMock,
    });

    render(<StreamingChat brief={mockBrief} boardId="board-1" />);

    // Assert rate-limit copy is shown
    expect(
      screen.getByText("The AI service has reached its usage limit. Please try again later.")
    ).toBeInTheDocument();

    // Assert button is disabled and its label contains a number
    const retryButton = screen.getByRole("button", { name: /retry/i });
    expect(retryButton).toBeDisabled();
    expect(retryButton).toHaveTextContent(/retry \(\d+s\)/i);
  });

  it("handles generic error by showing generic copy and an enabled button that calls regenerate on click", () => {
    const regenerateMock = vi.fn();

    mockUseChat.mockReturnValue({
      messages: [],
      setMessages: vi.fn(),
      sendMessage: vi.fn(),
      status: "error",
      stop: vi.fn(),
      error: new Error("generic"),
      regenerate: regenerateMock,
    });

    render(<StreamingChat brief={mockBrief} boardId="board-1" />);

    // Assert generic copy is shown
    expect(
      screen.getByText("Something went wrong. Retry will resend your last message.")
    ).toBeInTheDocument();

    // Assert button is enabled and calls regenerate() on click
    const retryButton = screen.getByRole("button", { name: /^retry$/i });
    expect(retryButton).toBeEnabled();

    fireEvent.click(retryButton);
    expect(regenerateMock).toHaveBeenCalledTimes(1);
  });

  it("handles truncated reply when onFinish has finishReason undefined and status ready", () => {
    const regenerateMock = vi.fn();

    mockUseChat.mockReturnValue({
      messages: [],
      setMessages: vi.fn(),
      sendMessage: vi.fn(),
      status: "ready",
      stop: vi.fn(),
      error: undefined,
      regenerate: regenerateMock,
    });

    render(<StreamingChat brief={mockBrief} boardId="board-1" />);

    const chatOptions = mockUseChat.mock.calls[0][0];
    act(() => {
      chatOptions.onFinish({
        isAbort: false,
        isError: false,
        finishReason: undefined,
      });
    });

    // Assert the truncated copy shows
    expect(
      screen.getByText("The reply was cut off. Retry will resend your last message.")
    ).toBeInTheDocument();

    // Assert Retry is enabled and calls regenerate() on click
    const retryButton = screen.getByRole("button", { name: /^retry$/i });
    expect(retryButton).toBeEnabled();

    fireEvent.click(retryButton);
    expect(regenerateMock).toHaveBeenCalledTimes(1);
  });

  it("does not render alert when onFinish has finishReason 'stop' and status ready", () => {
    mockUseChat.mockReturnValue({
      messages: [],
      setMessages: vi.fn(),
      sendMessage: vi.fn(),
      status: "ready",
      stop: vi.fn(),
      error: undefined,
      regenerate: vi.fn(),
    });

    render(<StreamingChat brief={mockBrief} boardId="board-1" />);

    const chatOptions = mockUseChat.mock.calls[0][0];
    act(() => {
      chatOptions.onFinish({
        isAbort: false,
        isError: false,
        finishReason: "stop",
      });
    });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("puts suggestion text in the input and does not call sendMessage when clicked", () => {
    const sendMessageMock = vi.fn();

    mockUseChat.mockReturnValue({
      messages: [],
      setMessages: vi.fn(),
      sendMessage: sendMessageMock,
      status: "ready",
      stop: vi.fn(),
      error: undefined,
      regenerate: vi.fn(),
    });

    render(<StreamingChat brief={mockBrief} boardId="board-1" />);

    const suggestion = `Suggest a colour palette for ${mockBrief.brandName}`;
    const button = screen.getByRole("button", { name: suggestion });

    fireEvent.click(button);

    const input = screen.getByRole("textbox", { name: /message/i });
    expect(input).toHaveValue(suggestion);
    expect(sendMessageMock).not.toHaveBeenCalled();
  });
});

