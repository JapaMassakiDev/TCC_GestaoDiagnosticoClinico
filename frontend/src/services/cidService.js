const URL_API = "http://localhost:3000/integrations";

export async function buscarCids(termo = "") {
  try {
    const resposta = await fetch(`${URL_API}/cid?query=${encodeURIComponent(termo)}`);
    if (!resposta.ok) return [];
    return await resposta.json();
  } catch {
    return [];
  }
}
