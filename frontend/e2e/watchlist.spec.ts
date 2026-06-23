import { test, expect } from "@playwright/test";
import { loginViaUI } from "./helpers";

test.describe("watchlist", () => {
  test("watchlist page renders", async ({ page }) => {
    await loginViaUI(page);
    await page.goto("/watchlist");
    await expect(page.getByText("Watchlist")).toBeVisible();
  });

  test("new test user has an empty watchlist", async ({ page }) => {
    await loginViaUI(page);
    await page.goto("/watchlist");
    await expect(page.getByText("Watchlist")).toBeVisible();
    await expect(page.getByText(/watchlist is empty/i)).toBeVisible();
  });
});
