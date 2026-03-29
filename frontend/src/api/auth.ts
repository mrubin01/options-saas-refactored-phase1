import { apiGet } from "./client";
import { apiFetch } from "./http";

export type AuthUser = {
  id: number;
  email: string;
  is_email_verified?: boolean;
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

export async function register(email: string, password: string): Promise<AuthUser> {
  return apiFetch<AuthUser>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
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

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
    skipAuthRetry: true,
  });
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, new_password: newPassword }),
    skipAuthRetry: true,
  });
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
    skipAuthRetry: true,
  });
}

export async function resendVerification(email: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
    skipAuthRetry: true,
  });
}

export function fetchMe(): Promise<AuthUser> {
  return apiGet<AuthUser>("/auth/me");
}
