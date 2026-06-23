import { test, expect } from "@playwright/test";
import { TEST_EMAIL, TEST_PASSWORD } from "./constants";

test.describe("authentication", () => {
  test("unauthenticated user is redirected to login", async ({ page }) => {
    await page.goto("/covered-calls");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login with valid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("Email").fill(TEST_EMAIL);
    await page.getByPlaceholder("Password").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page).toHaveURL(/\/covered-calls/);
    await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();
  });

  test("login with wrong password shows error", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("Email").fill(TEST_EMAIL);
    await page.getByPlaceholder("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByText(/invalid/i)).toBeVisible();
  });

  test("logout redirects to login", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("Email").fill(TEST_EMAIL);
    await page.getByPlaceholder("Password").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL("**/covered-calls");

    await page.getByRole("button", { name: "Logout" }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
