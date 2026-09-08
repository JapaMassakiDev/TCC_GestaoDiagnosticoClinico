import { searchCid11 } from '../integrations/CID-11';

export async function searchCids(query = '') {
  return searchCid11(query);
}
