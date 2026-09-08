const API_URL = "http://SEU_IP_LOCAL:3000/api";
export const MOCK_MODE = true;
export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, { headers: { "Content-Type": "application/json", ...(options.headers || {}) }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Erro na comunicação com o servidor.");
  return data;
}
