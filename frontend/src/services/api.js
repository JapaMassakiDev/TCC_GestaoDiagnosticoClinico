const API_URL = "http://SEU_IP_LOCAL:3000";

let globalToken = null;

export function setApiToken(token) {
  globalToken = token;
}

export async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (globalToken) {
    headers["Authorization"] = `Bearer ${globalToken}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || "Erro na comunica\u00e7\u00e3o com o servidor.");
  }

  return data;
}
