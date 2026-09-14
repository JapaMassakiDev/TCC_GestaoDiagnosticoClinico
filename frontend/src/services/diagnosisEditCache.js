import AsyncStorage from "@react-native-async-storage/async-storage";

const CHAVE = "saude-app:diagnosticos-edicao-utilizada";

export async function listarEdicoesUtilizadas() {
  try {
    const valor = await AsyncStorage.getItem(CHAVE);
    const ids = valor ? JSON.parse(valor) : [];
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
}

export async function marcarEdicaoComoUtilizada(diagnosticoId) {
  const ids = await listarEdicoesUtilizadas();
  if (ids.includes(diagnosticoId)) return ids;
  const atualizados = [...ids, diagnosticoId];
  await AsyncStorage.setItem(CHAVE, JSON.stringify(atualizados));
  return atualizados;
}
