import { test, expect } from "@playwright/test";
import type { BrowserContext, Page } from "@playwright/test";
import { loginViaUI } from "./helpers";

let context: BrowserContext;
let page: Page;

test.beforeAll(async ({ browser }) => {
  context = await browser.newContext();
  page = await context.newPage();
  await loginViaUI(page);
});

test.afterAll(async () => {
  await context.close();
});

test.describe("watchlist", () => {
  test("watchlist page renders", async () => {
    await page.goto("/watchlist");
    await expect(page.getByRole("heading", { name: "Watchlist" })).toBeVisible();
  });

  test("new test user has an empty watchlist", async () => {
    await page.goto("/watchlist");
    await expect(page.getByRole("heading", { name: "Watchlist" })).toBeVisible();
    await expect(page.getByText(/watchlist is empty/i)).toBeVisible();
  });
});
