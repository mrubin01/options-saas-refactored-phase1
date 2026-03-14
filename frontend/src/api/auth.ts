import { apiGet } from "./client";
import { apiFetch } from "./http";

export async function login(email: string, password: string) {
  const body = new URLSearchParams();
  body.set("username", email);
  body.set("password", password);

  return apiFetch<{ access_token: string; token_type: string; user: any }>(
    "/auth/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    }
  );
}

export type MeResponse = {
  id: number;
  email: string;
};

export function fetchMe(): Promise<MeResponse> {
  return apiGet<MeResponse>("/auth/me");
}

