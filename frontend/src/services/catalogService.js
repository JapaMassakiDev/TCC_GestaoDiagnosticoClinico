const URL_API = "http://localhost:3000/integrations";

export async function buscarMedicamentos(termo = "") {
  try {
    const resposta = await fetch(`${URL_API}/sngpc?query=${encodeURIComponent(termo)}`);
    if (!resposta.ok) return [];
    return await resposta.json();
  } catch {
    return [];
  }
}
