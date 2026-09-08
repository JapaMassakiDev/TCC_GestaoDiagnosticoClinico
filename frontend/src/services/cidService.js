const API_URL = "http://localhost:3000/integrations";

export async function searchCids(query = "") {
  try {
    const response = await fetch(`${API_URL}/cid?query=${encodeURIComponent(query)}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    return [];
  }
}
