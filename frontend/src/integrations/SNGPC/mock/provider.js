import { sngpcMockData } from './data';

export async function searchSngpcMock(query = '') {
  const text = String(query).trim().toLowerCase();
  if (!text) return sngpcMockData;
  return sngpcMockData.filter((item) => `${item.name} ${item.activeIngredient} ${item.administrationRoute} ${item.registry}`.toLowerCase().includes(text));
}
