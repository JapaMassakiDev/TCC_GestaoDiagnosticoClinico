import { requisitarApi } from "./api";

function normalizarAutorizacao(item = {}) {
  return {
    id: item.id,
    unidadeNome: item.unidade_nome ?? item.unitName ?? item.unidade?.nome ?? "Unidade",
    donoNome: item.dono_nome ?? item.ownerName ?? item.dono?.nome ?? "Responsável da unidade",
    contratoNome: item.contrato_nome ?? item.contractName ?? item.contrato?.nome ?? "Contrato anexado",
    contratoUrl: item.contrato_url ?? item.contractUrl ?? item.contrato?.url,
    criadoEm: item.criado_em ?? item.createdAt ?? item.created_at,
  };
}

export async function listarAutorizacoesPendentes() {
  const resposta = await requisitarApi("/autorizacoes/medico/pendentes");
  const itens = Array.isArray(resposta) ? resposta : resposta?.data ?? resposta?.autorizacoes ?? [];
  return itens.map(normalizarAutorizacao);
}

export async function confirmarAutorizacao(id) {
  return requisitarApi(`/autorizacoes/${id}/confirmar`, { method: "PUT" });
}

export async function cancelarAutorizacao(id) {
  return requisitarApi(`/autorizacoes/${id}/cancelar`, { method: "PUT" });
}
