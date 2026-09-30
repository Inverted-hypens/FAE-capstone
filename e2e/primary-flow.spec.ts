import { test, expect } from "@playwright/test";

// Encodes events as the AI SDK's UI message stream (server-sent events).
const sse = (events: object[]) =>
  events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join("") + "data: [DONE]\n\n";

test("fill the brief, open the chat, and get a streamed reply", async ({ page }) => {
  // The real AI route is never reached: every /api/chat request is answered here.
  let requestBody: { brief?: { brandName?: string } } | undefined;
  await page.route("**/api/chat", async (route) => {
    requestBody = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      headers: {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        "x-vercel-ai-ui-message-stream": "v1",
      },
      body: sse([
        { type: "start", messageId: "msg-1" },
        { type: "start-step" },
        { type: "text-start", id: "t1" },
        { type: "text-delta", id: "t1", delta: "Try a deep " },
        { type: "text-delta", id: "t1", delta: "compass blue." },
        { type: "text-end", id: "t1" },
        { type: "finish-step" },
        { type: "finish", finishReason: "stop" },
      ]),
    });
  });

  // 1. Fill and submit the brand brief.
  await page.goto("/brief");
  await page.getByLabel("Brand name").fill("Acme");
  await page.getByLabel("Industry/niche").fill("Technology");
  await page.getByLabel("One-sentence description").fill("Modern developer tools for everyone");
  await page.getByLabel("Target audience").fill("Software engineers");
  await page.getByLabel("Brand goals").fill("Build delightful software");
  // The checkboxes are visually hidden (styled as pills), so the click is forced.
  await page.getByRole("checkbox", { name: "modern" }).check({ force: true });
  await page.getByRole("checkbox", { name: "minimal" }).check({ force: true });
  await page.getByLabel("Keywords").fill("compass clarity direction");
  await page.getByRole("button", { name: "Submit brand brief" }).click();

  await expect(page.getByText("Brand brief submitted successfully.")).toBeVisible();

  // 2. Continue to the results page, where the chat loads the saved brief.
  await page.getByRole("link", { name: "Continue to your chat" }).click();
  await expect(page).toHaveURL(/\/results\/.+/);
  await expect(page.getByRole("heading", { name: "Refine your brand direction" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ask about Acme" })).toBeVisible();

  // 3. Send a message and read the streamed reply.
  await page.getByRole("textbox", { name: "Message" }).fill("Suggest a palette");
  await page.getByRole("button", { name: "Send message" }).click();

  const log = page.getByRole("log");
  await expect(log).toContainText("Suggest a palette");
  await expect(log).toContainText("Try a deep compass blue.");
  const chat = page.getByRole("region", { name: "Brand strategist chat" });
  await expect(chat.getByRole("alert")).toHaveCount(0);

  // The brief from step 1 travelled with the request.
  expect(requestBody?.brief?.brandName).toBe("Acme");
});
