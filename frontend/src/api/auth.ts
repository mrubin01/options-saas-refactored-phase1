import { apiGet } from "./client";
import { apiFetch } from "./http";

export type AuthUser = {
  id: number;
  email: string;
};

export type AuthSessionResponse = {
  access_token: string;
  token_type: string;
  user: AuthUser;
};

export async function login(email: string, password: string): Promise<AuthSessionResponse> {
  const body = new URLSearchParams();
  body.set("username", email);
  body.set("password", password);

  return apiFetch<AuthSessionResponse>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    skipAuthRetry: true,
  });
}

export async function refreshSession(): Promise<AuthSessionResponse> {
  return apiFetch<AuthSessionResponse>("/auth/refresh", {
    method: "POST",
    skipAuthRetry: true,
  });
}

export async function logout(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/logout", {
    method: "POST",
    skipAuthRetry: true,
  });
}

export function fetchMe(): Promise<AuthUser> {
  return apiGet<AuthUser>("/auth/me");
}

