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

test.describe("screener pages", () => {
  test("covered calls page renders", async () => {
    await page.goto("/covered-calls");
    await expect(page.getByText("Best Covered Calls")).toBeVisible();
    await expect(page.getByPlaceholder("Ticker")).toBeVisible();
  });

  test("put options page renders", async () => {
    await page.goto("/put-options");
    await expect(page.getByText("Best Put Options")).toBeVisible();
    await expect(page.getByPlaceholder("Ticker")).toBeVisible();
  });

  test("spread options page renders", async () => {
    await page.goto("/spread-options");
    await expect(page.getByText("Best Spread Options")).toBeVisible();
    await expect(page.getByPlaceholder("Ticker")).toBeVisible();
  });

  test("navigation links are visible", async () => {
    await expect(page.getByRole("link", { name: "Covered Calls" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Put Options" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Spread Options" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Watchlist" })).toBeVisible();
  });
});
