import { cid11MockData } from './data';

export async function searchCid11Mock(query = '') {
  const text = String(query).trim().toLowerCase();
  if (!text) return cid11MockData;
  return cid11MockData.filter((item) => `${item.code} ${item.title} ${item.description}`.toLowerCase().includes(text));
}
