const API_URL = "http://SEU_IP_LOCAL:3000/api";

/*
  Este arquivo é a ponte para o backend real.

  Enquanto MOCK_MODE = true, nenhuma requisição HTTP é feita.
  Quando o backend estiver pronto:
    1. Troque MOCK_MODE para false.
    2. Ajuste API_URL.
    3. Implemente os endpoints equivalentes no backend.
*/
export const MOCK_MODE = true;

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Erro na comunicação com o servidor.");
  }

  return data;
}
