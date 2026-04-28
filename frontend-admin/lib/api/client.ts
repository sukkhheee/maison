import { clearSession, readToken } from "@/lib/auth/storage";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiOptions extends RequestInit {
  /** Skip the Authorization header — used by /auth/login + /auth/register-salon. */
  anonymous?: boolean;
}

export async function api<T>(path: string, init?: ApiOptions): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...((init?.headers as Record<string, string>) ?? {})
  };

  if (!init?.anonymous) {
    const token = readToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  } catch (cause) {
    throw new ApiError(0, "NETWORK_ERROR", "Сервертэй холбогдож чадсангүй.", {
      cause: String(cause)
    });
  }

  if (res.status === 401 && !init?.anonymous) {
    // Token expired or revoked — drop it so the next render redirects to /login.
    clearSession();
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const body = text ? safeJson(text) : null;

  if (!res.ok) {
    // Narrow once so TS infers concrete types instead of `unknown` after &&.
    const err = (body ?? {}) as {
      code?: string;
      message?: string;
      details?: Record<string, unknown>;
    };
    const code = err.code ?? `HTTP_${res.status}`;
    const message = err.message ?? res.statusText;
    throw new ApiError(res.status, code, message, err.details);
  }
  return body as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
