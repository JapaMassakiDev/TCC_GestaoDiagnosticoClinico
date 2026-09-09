import { apiFetch, setApiToken } from "./api";
import { onlyDigits } from "../utils/masks";

export async function checkCpf(cpf) {
  const cleanCpf = onlyDigits(cpf);
  const data = await apiFetch(`/auth/check-cpf/${cleanCpf}`);
  return data;
}

export async function loginWithCpf({ cpf, password }) {
  const cleanCpf = onlyDigits(cpf);
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ cpf: cleanCpf, senha: password })
  });

  let role = "paciente";
  if (data.usuario.cpf === "11122233344") role = "dono";
  else if (data.usuario.cpf === "98765432100") role = "medico";

  const user = {
    id: data.usuario.id,
    name: data.usuario.nome_completo,
    cpf: data.usuario.cpf,
    email: data.usuario.email,
    role
  };

  return { token: data.token, user };
}

export async function sendResetEmail(email) {
  return { ok: true };
}

export async function resetPassword(userId, password) {
  return { ok: true };
}

export async function registerUser(payload) {
  const clean = {
    ...payload,
    cpf: onlyDigits(payload.cpf),
    crm: payload.crm ? onlyDigits(payload.crm) : undefined,
    cnpj: payload.cnpj ? onlyDigits(payload.cnpj) : undefined
  };

  // 1. Cadastrar Usu\u00e1rio
  await apiFetch("/usuarios", {
    method: "POST",
    body: JSON.stringify({
      cpf: clean.cpf,
      nome_completo: clean.name,
      email: clean.email,
      senha: clean.password
    })
  });

  // 2. Fazer Login para obter Token
  const loginData = await loginWithCpf({ cpf: clean.cpf, password: clean.password });
  setApiToken(loginData.token); // Habilita o JWT nas pr\u00f3ximas rotas

  // 3. Se for Dono, Criar o Tenant
  if (clean.role === "dono") {
    await apiFetch("/tenants", {
      method: "POST",
      body: JSON.stringify({
        cnpj: clean.cnpj,
        razao_social: clean.unitName,
        nome_fantasia: clean.unitName,
        cep: clean.cep ? onlyDigits(clean.cep) : undefined
      })
    });
  }

  // Set the role in the local payload for UI routing logic
  loginData.user.role = clean.role;
  return loginData;
}

export async function updateProfile(userId, payload) {
  // O backend de Profile n\u00e3o est\u00e1 completamente mockado, retornamos fake pra UI n\u00e3o quebrar
  return { user: { id: userId, ...payload } };
}
