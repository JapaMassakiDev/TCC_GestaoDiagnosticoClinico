import { mockCepRows } from "./data";

const digits = (value = "") => String(value).replace(/\D/g, "");
const normalize = (value = "") => String(value)
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLocaleLowerCase("pt-BR")
  .trim();
const wait = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export async function searchCepMock(query = "") {
  await wait();
  const clean = digits(query);
  if (!clean) return [];
  return mockCepRows.filter((row) => digits(row.cep).startsWith(clean)).slice(0, 5);
}

export async function searchAddressMock(query = "") {
  await wait();
  const clean = normalize(query);
  if (clean.length < 3) return [];

  return mockCepRows.filter((row) => {
    const searchable = normalize([
      row.logradouro,
      row.bairro,
      row.localidade,
      row.uf,
      row.estado,
    ].filter(Boolean).join(" "));
    return searchable.includes(clean);
  }).slice(0, 5);
}

export async function getCepMock(cep) {
  await wait();
  const clean = digits(cep);
  return mockCepRows.find((row) => digits(row.cep) === clean) || null;
}
