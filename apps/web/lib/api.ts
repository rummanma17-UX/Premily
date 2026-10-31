const configuredApiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
const API_URL =
  configuredApiUrl ||
  (process.env.NODE_ENV === "development" ? "http://localhost:4000" : "");

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  if (!API_URL && !path.startsWith("http")) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    credentials: options?.credentials ?? "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(
      typeof body.error === "string" ? body.error : "Request failed",
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
