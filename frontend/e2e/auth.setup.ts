import { test as setup } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

export const AUTH_FILE = "e2e/.auth/user.json";
export const TEST_EMAIL = "e2e@playwright.local";
export const TEST_PASSWORD = "PlaywrightE2E123!";

setup("authenticate", async ({ page, request }) => {
  const apiUrl = process.env.VITE_API_URL || "http://localhost:8000";

  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

  // Register test user — ignore error if already exists
  await request.post(`${apiUrl}/v1/auth/register`, {
    data: { email: TEST_EMAIL, password: TEST_PASSWORD },
  });

  // Login via UI so the refresh cookie is set in the browser context
  await page.goto("/login");
  await page.getByPlaceholder("Email").fill(TEST_EMAIL);
  await page.getByPlaceholder("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Login" }).click();
  await page.waitForURL("**/covered-calls");

  await page.context().storageState({ path: AUTH_FILE });
});
