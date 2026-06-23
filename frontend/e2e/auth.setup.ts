import { test as setup } from "@playwright/test";
import { TEST_EMAIL, TEST_PASSWORD } from "./constants";

setup("create test user", async ({ request }) => {
  const apiUrl = process.env.VITE_API_URL || "http://localhost:8000";

  const reg = await request.post(`${apiUrl}/v1/auth/register`, {
    data: { email: TEST_EMAIL, password: TEST_PASSWORD },
  });

  if (!reg.ok()) {
    const body = await reg.json().catch(() => ({}));
    const code = (body as { error?: { code?: string } })?.error?.code;
    if (code !== "EMAIL_ALREADY_REGISTERED") {
      throw new Error(`Registration failed: ${JSON.stringify(body)}`);
    }
  }
});
