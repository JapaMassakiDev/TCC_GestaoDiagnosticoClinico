import { definirTokenApi, requisitarApi } from "./api";
import { somenteDigitos } from "../utils/masks";

async function requisitarComRotasAlternativas(rotas, opcoes) {
  let ultimoErro = null;
  for (const rota of rotas) {
    try {
      return await requisitarApi(rota, opcoes);
    } catch (erro) {
      ultimoErro = erro;
    }
  }
  throw ultimoErro || new Error("Não foi possível comunicar com a API de autenticação.");
}

export function normalizarUsuario(usuario = {}) {
  const papel = usuario.papel ?? usuario.role ?? usuario.tipo ?? "paciente";
  const nome = usuario.nome ?? usuario.name ?? usuario.nome_completo ?? "";
  const telefone = usuario.telefone ?? usuario.phone;
  const sexo = usuario.sexo ?? usuario.sex;
  const dataNascimento = usuario.dataNascimento ?? usuario.birthDate ?? usuario.data_nascimento;
  const unidadeId = usuario.unidadeId ?? usuario.unitId ?? usuario.tenant_id;

  const papeisRecebidos = usuario.papeis ?? usuario.roles ?? [papel];
  const papeis = [...new Set((Array.isArray(papeisRecebidos) ? papeisRecebidos : [papeisRecebidos]).filter(Boolean).map((item) => String(item).toLowerCase()))];

  return {
    id: usuario.id,
    nome, name: nome,
    cpf: usuario.cpf ?? "",
    email: usuario.email ?? "",
    papel, role: papel,
    crm: usuario.crm,
    cnpj: usuario.cnpj,
    telefone, phone: telefone,
    sexo, sex: sexo,
    dataNascimento, birthDate: dataNascimento,
    unidadeId, unitId: unidadeId,
    papeis, roles: papeis,
  };
}

export async function verificarCpf(cpf) {
  const cpfLimpo = somenteDigitos(cpf);
  return requisitarApi(`/auth/check-cpf/${cpfLimpo}`);
}

export async function entrarComCpf({ cpf, senha }) {
  const cpfLimpo = somenteDigitos(cpf);
  const resposta = await requisitarApi("/auth/login", {
    method: "POST",
    body: JSON.stringify({ cpf: cpfLimpo, senha }),
  });

  const usuarioApi = resposta.user ?? resposta.usuario ?? {};
  const usuario = normalizarUsuario(usuarioApi);

  // Compatibilidade com o mock antigo, que não retornava o papel.
  if (!usuarioApi.role && !usuarioApi.papel && !usuarioApi.tipo) {
    if (usuario.cpf === "11122233344") usuario.role = "dono";
    else if (usuario.cpf === "98765432100") usuario.role = "medico";
    usuario.papel = usuario.role;
    usuario.papeis = [usuario.role];
    usuario.roles = usuario.papeis;
  }

  const papeisResposta = resposta.papeis ?? resposta.roles;
  if (papeisResposta) {
    usuario.papeis = [...new Set(papeisResposta.map((item) => String(item).toLowerCase()))];
    usuario.roles = usuario.papeis;
  }
  return { token: resposta.token, user: usuario, papeis: usuario.papeis };
}

export async function validarSenhaAtual({ cpf, senha }) {
  const cpfLimpo = somenteDigitos(cpf);
  if (!senha) throw new Error("Informe sua senha atual.");
  await requisitarApi("/auth/login", {
    method: "POST",
    body: JSON.stringify({ cpf: cpfLimpo, senha }),
  });
  return true;
}

export async function selecionarPapelAcesso({ papel, crm, cnpj }) {
  const resposta = await requisitarApi("/auth/selecionar-papel", {
    method: "POST",
    body: JSON.stringify({
      papel,
      crm: crm ? somenteDigitos(crm) : undefined,
      cnpj: cnpj ? somenteDigitos(cnpj) : undefined,
    }),
  });
  return {
    token: resposta.token,
    user: normalizarUsuario(resposta.usuario ?? resposta.user ?? resposta.data),
  };
}

export async function adicionarPapelUsuario(usuarioId, dadosCadastro) {
  return requisitarApi(`/usuarios/${usuarioId}/papeis`, {
    method: "PUT",
    body: JSON.stringify({
      papel: dadosCadastro.role,
      cpf: dadosCadastro.cpf,
      nome_completo: dadosCadastro.name,
      email: dadosCadastro.email,
      senha: dadosCadastro.password,
      crm: dadosCadastro.crm ? somenteDigitos(dadosCadastro.crm) : undefined,
      cnpj: dadosCadastro.cnpj ? somenteDigitos(dadosCadastro.cnpj) : undefined,
      nome_unidade: dadosCadastro.unitName,
      cep: dadosCadastro.cep ? somenteDigitos(dadosCadastro.cep) : undefined,
      endereco: dadosCadastro.address,
      numero: dadosCadastro.number,
      telefone: dadosCadastro.phone ? somenteDigitos(dadosCadastro.phone) : undefined,
      logo_uri: dadosCadastro.logoUri,
      sexo: dadosCadastro.sex,
      data_nascimento: dadosCadastro.birthDate,
    }),
  });
}

export async function enviarEmailRedefinicao(email) {
  try {
    return await requisitarComRotasAlternativas(
      ["/auth/esqueci-senha"],
      { method: "POST", body: JSON.stringify({ email }) },
    );
  } catch {
    return { ok: true };
  }
}

export async function redefinirSenha(usuarioId, senha) {
  try {
    return await requisitarComRotasAlternativas(
      ["/auth/redefinir-senha"],
      { method: "POST", body: JSON.stringify({ userId: usuarioId, password: senha }) },
    );
  } catch {
    return { ok: true };
  }
}

export async function cadastrarUsuario(dadosCadastro) {
  const dadosLimpos = {
    ...dadosCadastro,
    cpf: somenteDigitos(dadosCadastro.cpf),
    crm: dadosCadastro.crm ? somenteDigitos(dadosCadastro.crm) : undefined,
    cnpj: dadosCadastro.cnpj ? somenteDigitos(dadosCadastro.cnpj) : undefined,
  };

  if (dadosCadastro.usuarioId) {
    const resposta = await adicionarPapelUsuario(dadosCadastro.usuarioId, dadosLimpos);
    if (resposta?.token) return { token: resposta.token, user: normalizarUsuario(resposta.usuario ?? resposta.user ?? resposta.data) };
    return entrarComCpf({ cpf: dadosLimpos.cpf, senha: dadosLimpos.password });
  }

  if (dadosLimpos.role === "dono" || dadosLimpos.role === "medico") {
    throw new Error(`Para se registrar como ${dadosLimpos.role}, você precisa já estar cadastrado no sistema como paciente.`);
  }

  await requisitarApi("/usuarios", {
    method: "POST",
    body: JSON.stringify({
      cpf: dadosLimpos.cpf,
      nome_completo: dadosLimpos.name,
      email: dadosLimpos.email,
      senha: dadosLimpos.password,
      telefone: dadosLimpos.phone ? somenteDigitos(dadosLimpos.phone) : undefined,
      sexo: dadosLimpos.sex,
      data_nascimento: dadosLimpos.birthDate
    }),
  });

  const dadosLogin = await entrarComCpf({ cpf: dadosLimpos.cpf, senha: dadosLimpos.password });
  definirTokenApi(dadosLogin.token);

  if (dadosLimpos.role === "dono") {
    // Tipo de tenant: se tiver CNPJ é CLINICA, senão AUTONOMO (usando CPF)
    const tipo_tenant = dadosLimpos.cnpj ? 'CLINICA' : 'AUTONOMO';
    
    await requisitarApi("/tenants", {
      method: "POST",
      body: JSON.stringify({
        tipo_tenant,
        cpf: tipo_tenant === 'AUTONOMO' ? dadosLimpos.cpf : undefined,
        cnpj: tipo_tenant === 'CLINICA' ? dadosLimpos.cnpj : undefined,
        razao_social: dadosLimpos.unitName || dadosLimpos.name,
        nome_fantasia: dadosLimpos.unitName || dadosLimpos.name,
        cep: dadosLimpos.cep ? somenteDigitos(dadosLimpos.cep) : undefined,
      }),
    }).catch(() => null);
  }

  dadosLogin.user.role = dadosLimpos.role;
  return dadosLogin;
}

export async function atualizarPerfil(usuarioId, dadosPerfil) {
  try {
    const resposta = await requisitarComRotasAlternativas(
      [`/usuarios/${usuarioId}`],
      { method: "PUT", body: JSON.stringify(dadosPerfil) },
    );
    return { user: normalizarUsuario(resposta.user ?? resposta.usuario ?? resposta) };
  } catch {
    return { user: { id: usuarioId, ...dadosPerfil } };
  }
}
