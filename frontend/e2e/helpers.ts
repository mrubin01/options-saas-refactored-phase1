import type { Page } from "@playwright/test";
import { TEST_EMAIL, TEST_PASSWORD } from "./constants";

export async function loginViaUI(page: Page): Promise<void> {
  await page.goto("/login");
  await page.getByPlaceholder("Email").fill(TEST_EMAIL);
  await page.getByPlaceholder("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Login" }).click();
  await page.waitForURL("**/covered-calls");
}
