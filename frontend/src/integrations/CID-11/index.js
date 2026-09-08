// Contrato estável da integração CID-11.
// No futuro, substitua apenas a implementação interna deste diretório pela API oficial.
// As telas e services não precisam mudar.
import { searchCid11Mock } from './mock/provider';

export async function searchCid11(query = '') {
  return searchCid11Mock(query);
}
