const API_HOST = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const API_VERSION = import.meta.env.VITE_API_VERSION || "v1";
const API_URL = `${API_HOST}/${API_VERSION}`;

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

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: any;
  request_id?: string;
}

export interface ApiMeta {
  request_id?: string;
  version?: string;
  pagination?: any;
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
  details?: any;
  requestId?: string;
  status: number;

  constructor(message: string, code: string, status: number, details?: any, requestId?: string) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
    this.requestId = requestId;
  }
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function generateRequestId() {
  return getRequestId();
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const requestId = generateRequestId();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Request-ID": requestId,
    ...authHeaders(),
    ...(options.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem("access_token");
    window.location.href = "/login?expired=1";
    throw new Error("Unauthorized");
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    // fallback for non-JSON responses
    if (!res.ok) throw new Error(await res.text());
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
