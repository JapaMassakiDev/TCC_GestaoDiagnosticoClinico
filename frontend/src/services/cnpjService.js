import { requisitarApi } from "./api";
import { somenteDigitos } from "../utils/masks";

export async function consultarCnpj(cnpj) {
  const cnpjLimpo = somenteDigitos(cnpj);

  if (cnpjLimpo.length !== 14) {
    throw new Error("Informe os 14 números do CNPJ.");
  }

  return requisitarApi(`/integrations/cnpj/${cnpjLimpo}`);
}
