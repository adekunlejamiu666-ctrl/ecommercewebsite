const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5008/api/v1"
).replace(/\/+$/, "");

export async function apiRequest(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}.`);
  }

  return data;
}
