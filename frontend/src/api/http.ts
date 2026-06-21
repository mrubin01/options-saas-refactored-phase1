import { clearAccessToken, getAccessToken, setAccessToken } from "../auth/tokenStore";

function getRequestId(): string {
  if (
    typeof globalThis !== "undefined" &&
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `req-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getApiHost(): string {
  const envApiUrl = String(import.meta.env.VITE_API_URL ?? "").trim();

  if (envApiUrl) {
    return envApiUrl.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";

    if (isLocalHost) {
      return "http://localhost:8000";
    }

    // In production, API requests are relative (proxied by nginx)
    return "";
  }

  return "";
}

const API_HOST = getApiHost();
const API_VERSION = String(import.meta.env.VITE_API_VERSION ?? "v1").trim() || "v1";
const API_URL = `${API_HOST.replace(/\/+$/, "")}/${API_VERSION}`;

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
  request_id?: string;
}

export interface ApiMeta {
  request_id?: string;
  version?: string;
  pagination?: unknown;
  timestamp?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiErrorPayload | null;
  meta: ApiMeta | null;
}

export class ApiClientError extends Error {
  code: string;
  details?: unknown;
  requestId?: string;
  status: number;

  constructor(message: string, code: string, status: number, details?: unknown, requestId?: string) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
    this.requestId = requestId;
  }
}

type ApiFetchOptions = RequestInit & {
  skipAuthRetry?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

function generateRequestId(): string {
  return getRequestId();
}

function buildHeaders(options: ApiFetchOptions): Record<string, string> {
  const headers = new Headers(options.headers ?? {});

  if (!headers.has("X-Request-ID")) {
    headers.set("X-Request-ID", generateRequestId());
  }

  const token = getAccessToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const hasBody = options.body !== undefined && options.body !== null;
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const isUrlEncoded = options.body instanceof URLSearchParams;

  if (hasBody && !isFormData && !isUrlEncoded && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return Object.fromEntries(headers.entries());
}

async function parseResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return (await res.text()) as unknown as T;
  }

  const payload: ApiResponse<T> = await res.json();

  if (!res.ok || !payload.success) {
    const err = payload.error;
    throw new ApiClientError(
      err?.message || "Unexpected API error",
      err?.code || "UNKNOWN_ERROR",
      res.status,
      err?.details,
      err?.request_id
    );
  }

  return payload.data as T;
}

async function requestNewAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "X-Request-ID": generateRequestId(),
        },
      });

      if (!res.ok) {
        clearAccessToken();
        return null;
      }

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        clearAccessToken();
        return null;
      }

      const payload: ApiResponse<{ access_token: string }> = await res.json();
      const newToken = payload?.data?.access_token ?? null;

      if (!res.ok || !payload.success || !newToken) {
        clearAccessToken();
        return null;
      }

      setAccessToken(newToken);
      return newToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

function handleAuthFailure() {
  clearAccessToken();
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.href = "/login?expired=1";
  }
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const headers = buildHeaders(options);

  const execute = () =>
    fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      credentials: "include",
    });

  let res = await execute();

  if (res.status === 401 && !options.skipAuthRetry) {
    const refreshedToken = await requestNewAccessToken();

    if (refreshedToken) {
      const retryHeaders = buildHeaders({
        ...options,
        headers: {
          ...(options.headers ?? {}),
          Authorization: `Bearer ${refreshedToken}`,
        },
      });

      res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: retryHeaders,
        credentials: "include",
      });
    } else {
      handleAuthFailure();
      throw new ApiClientError("Unauthorized", "UNAUTHORIZED", 401);
    }
  }

  if (res.status === 401) {
    if (!options.skipAuthRetry) {
      handleAuthFailure();
    }
    throw new ApiClientError("Unauthorized", "UNAUTHORIZED", 401);
  }

  return parseResponse<T>(res);
}
