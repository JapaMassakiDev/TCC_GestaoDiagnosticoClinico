import { mockUsers, mockUnits } from "../mock/database";
import { MOCK_MODE, apiFetch } from "./api";
import { onlyDigits } from "../utils/masks";
const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export async function checkCpf(cpf) {
  const cleanCpf = onlyDigits(cpf);
  if (!MOCK_MODE) return apiFetch(`/auth/check-cpf/${cleanCpf}`);
  await wait();
  return { exists: mockUsers.some((u) => u.cpf === cleanCpf) };
}
export async function loginWithCpf({ cpf, password }) {
  const cleanCpf = onlyDigits(cpf);
  if (!MOCK_MODE) return apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ cpf: cleanCpf, password }) });
  await wait();
  const user = mockUsers.find((u) => u.cpf === cleanCpf && u.password === password);
  if (!user) throw new Error("CPF ou senha inválidos.");
  return { token: `mock-token-${user.id}`, user };
}
export async function sendResetEmail(email) {
  if (!MOCK_MODE) return apiFetch("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
  await wait();
  const user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) throw new Error("E-mail não encontrado.");
  return { ok: true, userId: user.id };
}
export async function resetPassword(userId, password) {
  if (!MOCK_MODE) return apiFetch("/auth/reset-password", { method: "POST", body: JSON.stringify({ userId, password }) });
  await wait();
  const user = mockUsers.find((u) => u.id === userId);
  if (!user) throw new Error("Usuário não encontrado.");
  user.password = password;
  return { ok: true };
}
export async function registerUser(payload) {
  const clean = { ...payload, cpf: onlyDigits(payload.cpf), crm: payload.crm ? onlyDigits(payload.crm) : undefined, cnpj: payload.cnpj ? onlyDigits(payload.cnpj) : undefined };
  if (!MOCK_MODE) return apiFetch("/auth/register", { method: "POST", body: JSON.stringify(clean) });
  await wait();
  if (mockUsers.some((u) => u.cpf === clean.cpf)) throw new Error("CPF já cadastrado.");
  const user = { id: `user-${Date.now()}`, ...clean };
  if (clean.role === "dono") {
    const unit = { id: `unit-${Date.now()}`, ownerId: user.id, name: clean.unitName, cep: onlyDigits(clean.cep || ""), address: clean.address, number: clean.number, phone: onlyDigits(clean.phone), cnpj: clean.cnpj, logoUri: clean.logoUri || null, doctorIds: [] };
    mockUnits.push(unit); user.unitId = unit.id;
  }
  mockUsers.push(user);
  return { token: `mock-token-${user.id}`, user };
}

export async function updateProfile(userId, payload) {
  const clean = {
    ...payload,
    cpf: payload.cpf ? onlyDigits(payload.cpf) : undefined,
    crm: payload.crm ? onlyDigits(payload.crm) : undefined,
    cnpj: payload.cnpj ? onlyDigits(payload.cnpj) : undefined,
    phone: payload.phone ? onlyDigits(payload.phone) : undefined,
  };
  if (!MOCK_MODE) return apiFetch(`/users/${userId}`, { method: "PUT", body: JSON.stringify(clean) });
  await wait();
  const user = mockUsers.find((u) => u.id === userId);
  if (!user) throw new Error("Usuário não encontrado.");
  if (clean.cpf && mockUsers.some((u) => u.id !== userId && u.cpf === clean.cpf)) {
    throw new Error("Este CPF já pertence a outro cadastro.");
  }
  Object.entries(clean).forEach(([key, value]) => {
    if (value !== undefined) user[key] = value;
  });
  if (user.role === "dono" && user.unitId) {
    const unit = mockUnits.find((item) => item.id === user.unitId);
    if (unit) {
      if (payload.unitName !== undefined) unit.name = payload.unitName;
      if (payload.cep !== undefined) unit.cep = onlyDigits(payload.cep);
      if (payload.address !== undefined) unit.address = payload.address;
      if (payload.number !== undefined) unit.number = payload.number;
      if (payload.phone !== undefined) unit.phone = onlyDigits(payload.phone);
      if (payload.cnpj !== undefined) unit.cnpj = onlyDigits(payload.cnpj);
      if (payload.logoUri !== undefined) unit.logoUri = payload.logoUri;
    }
  }
  return { user };
}
