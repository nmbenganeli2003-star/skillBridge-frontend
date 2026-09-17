export const API =
  (import.meta as unknown as { env: { VITE_API_URL?: string } }).env
    .VITE_API_URL || "";
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API}/api${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = await response
    .json()
    .catch(() => ({ error: "The server returned an invalid response." }));
  if (!response.ok)
    throw new Error(data.error || "Request failed. Please try again.");
  return data;
}
export const send = <T>(path: string, body: unknown = {}, method = "POST") =>
  api<T>(path, { method, body: JSON.stringify(body) });
