import { searchSngpcMedications } from '../integrations/SNGPC';

export async function searchMedications(query = '') {
  return searchSngpcMedications(query);
}
