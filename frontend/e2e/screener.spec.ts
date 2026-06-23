import { test, expect } from "@playwright/test";
import { loginViaUI } from "./helpers";

test.describe("screener pages", () => {
  test("covered calls page renders", async ({ page }) => {
    await loginViaUI(page);
    await page.goto("/covered-calls");
    await expect(page.getByText("Best Covered Calls")).toBeVisible();
    await expect(page.getByPlaceholder("Ticker")).toBeVisible();
  });

  test("put options page renders", async ({ page }) => {
    await loginViaUI(page);
    await page.goto("/put-options");
    await expect(page.getByText("Best Put Options")).toBeVisible();
    await expect(page.getByPlaceholder("Ticker")).toBeVisible();
  });

  test("spread options page renders", async ({ page }) => {
    await loginViaUI(page);
    await page.goto("/spread-options");
    await expect(page.getByText("Best Spread Options")).toBeVisible();
    await expect(page.getByPlaceholder("Ticker")).toBeVisible();
  });

  test("navigation links are visible", async ({ page }) => {
    await loginViaUI(page);
    await expect(page.getByRole("link", { name: "Covered Calls" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Put Options" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Spread Options" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Watchlist" })).toBeVisible();
  });
});
