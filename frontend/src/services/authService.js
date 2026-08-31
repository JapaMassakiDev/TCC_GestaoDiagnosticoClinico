import { mockUsers } from "../mock/database";
import { MOCK_MODE, apiFetch } from "./api";
import { onlyDigits } from "../utils/masks";

const wait = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms));

export async function checkCpf(cpf) {
  const cleanCpf = onlyDigits(cpf);

  if (!MOCK_MODE) {
    return apiFetch(`/auth/check-cpf/${cleanCpf}`);
  }

  await wait();
  const user = mockUsers.find((item) => item.cpf === cleanCpf);

  return {
    exists: Boolean(user),
    user: user || null
  };
}

export async function loginWithCpf({ cpf, password }) {
  const cleanCpf = onlyDigits(cpf);

  if (!MOCK_MODE) {
    return apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ cpf: cleanCpf, password })
    });
  }

  await wait();

  const user = mockUsers.find(
    (item) => item.cpf === cleanCpf && item.password === password
  );

  if (!user) {
    throw new Error("CPF ou senha inválidos.");
  }

  return {
    token: `mock-token-${user.id}`,
    user
  };
}

export async function registerUser(payload) {
  const cleanPayload = {
    ...payload,
    cpf: onlyDigits(payload.cpf),
    cnpj: payload.cnpj ? onlyDigits(payload.cnpj) : undefined,
    crm: payload.crm ? onlyDigits(payload.crm) : undefined
  };

  if (!MOCK_MODE) {
    return apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(cleanPayload)
    });
  }

  await wait();

  const user = {
    id: `mock-${Date.now()}`,
    ...cleanPayload
  };

  return {
    token: `mock-token-${user.id}`,
    user
  };
}
