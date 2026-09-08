import { getCep, searchAddress, searchCep } from "../integrations/ViaCEP";

export const findCep = (cep) => getCep(cep);
export const searchCeps = (query) => searchCep(query);
export const searchAddresses = (query) => searchAddress(query);

const normalize = (value = "") => String(value)
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLocaleLowerCase("pt-BR")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

/**
 * Garante que o endereço digitado continue coerente com o CEP consultado.
 * O número fica fora desta validação porque é um campo próprio da unidade.
 * Quando o mock for substituído pelo ViaCEP real, este contrato continua igual.
 */
export async function validateCepAddress(cep, address) {
  const location = await getCep(cep);
  if (!location) {
    return { valid: false, location: null, reason: "CEP não localizado." };
  }

  const normalizedAddress = normalize(address);
  const requiredParts = [
    location.logradouro,
    location.bairro,
    location.localidade,
    location.uf,
  ]
    .filter(Boolean)
    .map(normalize);

  const missingPart = requiredParts.find((part) => part && !normalizedAddress.includes(part));
  if (missingPart) {
    return {
      valid: false,
      location,
      reason: "O endereço informado não corresponde ao CEP selecionado.",
    };
  }

  return { valid: true, location, reason: "" };
}
