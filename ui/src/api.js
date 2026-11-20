export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
export const API_CONFIGURED = Boolean(API_BASE_URL);

export async function apiRequest(path, { method = "GET", token, body } = {}) {
  const headers = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const contentType = response.headers.get("content-type") || "";
  const result = response.status === 204 ? null : contentType.includes("application/json") ? await response.json() : null;
  if (!response.ok) {
    const error = new Error(result?.error || `요청에 실패했습니다. (${response.status})`);
    error.status = response.status;
    throw error;
  }
  if (response.status !== 204 && result === null) throw new Error("API에서 올바른 JSON 응답을 받지 못했습니다.");
  return result;
}
