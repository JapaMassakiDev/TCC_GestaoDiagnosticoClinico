// CONTRATO ESTÁVEL DA INTEGRAÇÃO ViaCEP.
// Ao instalar a API real, mantenha estas funções e troque somente a implementação interna.
import { getCepMock, searchAddressMock, searchCepMock } from "./mock/provider";

export async function searchCep(query) {
  return searchCepMock(query);
}

export async function searchAddress(query) {
  return searchAddressMock(query);
}

export async function getCep(cep) {
  return getCepMock(cep);
}
