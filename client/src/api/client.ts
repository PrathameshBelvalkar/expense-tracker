const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";

type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  const text = await res.text();
  const json = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  if (!res.ok) {
    return { ok: false, error: (json?.error as string) ?? res.statusText };
  }
  if (res.status === 204) {
    return { ok: true, data: undefined as T };
  }
  if (json && (json as { ok?: boolean }).ok === false && json.error) {
    return { ok: false, error: json.error as string };
  }
  return { ok: true, data: (json?.data ?? json) as T };
}

export const api = {
  get: <T>(path: string) =>
    request<T>(path, { method: "GET" }),

  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),

  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),

  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),

  delete: (path: string) =>
    request<unknown>(path, { method: "DELETE" }),
};
