const API_URL = "http://localhost:3000/integrations";

export async function findCep(cep) {
  try {
    const response = await fetch(`${API_URL}/viacep/${cep}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data;
  } catch (error) {
    return null;
  }
}

export async function searchAddresses(query) {
  // Not implemented directly since ViaCEP proxy only supports CEP for now,
  // returning empty or mock fallback.
  return [];
}

export async function searchCeps(query) {
  return [];
}

export async function validateCepAddress(cep) {
  const data = await findCep(cep);
  if (!data || data.erro) {
    return { valid: false };
  }
  return {
    valid: true,
    address: `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`,
  };
}
