import { apiFetch, apiFetchPaged } from "./http";
import type { PagedResult } from "./http";

export function apiGet<T>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: "GET" });
}

export function apiGetPaged<T>(path: string): Promise<PagedResult<T>> {
  return apiFetchPaged<T>(path, { method: "GET" });
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function apiPut<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: "PUT",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

// no special-case 401; let http.ts handle it consistently

export function apiDelete<T>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: "DELETE" });
}

  


