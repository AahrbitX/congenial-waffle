const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    // Required for Better Auth cookies to work
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown Error" }));
    throw new Error(error.message || "Request failed");
  }

  return res.json();
}
