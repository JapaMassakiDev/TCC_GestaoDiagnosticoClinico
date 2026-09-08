// Contrato estável da integração SNGPC/ANVISA.
// No futuro, substitua apenas a implementação interna deste diretório pela integração real.
// As telas e services não precisam mudar.
import { searchSngpcMock } from './mock/provider';

export async function searchSngpcMedications(query = '') {
  return searchSngpcMock(query);
}
