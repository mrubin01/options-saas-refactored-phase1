import { test, expect } from "@playwright/test";
import { AUTH_FILE } from "./constants";

test.use({ storageState: AUTH_FILE });

test.describe("watchlist", () => {
  test("watchlist page renders", async ({ page }) => {
    await page.goto("/watchlist");
    await expect(page.getByText("Watchlist")).toBeVisible();
  });

  test("new test user has an empty watchlist", async ({ page }) => {
    await page.goto("/watchlist");
    await expect(page.getByText("Watchlist")).toBeVisible();
    await expect(page.getByText(/watchlist is empty/i)).toBeVisible();
  });
});
