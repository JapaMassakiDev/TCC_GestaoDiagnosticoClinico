import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Alert, Linking, Modal, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BotaoPrimario from "../components/BotaoPrimario";
import { usarAutenticacao } from "./AuthenticationContext";
import { cancelarAutorizacao, confirmarAutorizacao, listarAutorizacoesPendentes } from "../services/authorizationService";

const ContextoAutorizacao = createContext(null);
const PRAZO_AUTORIZACAO = 10 * 60 * 1000;

export function ProvedorAutorizacao({ children }) {
  const { usuario } = usarAutenticacao();
  const [pendentes, definirPendentes] = useState([]);
  const [modalVisivel, definirModalVisivel] = useState(false);
  const [carregando, definirCarregando] = useState(false);
  const [carregadoAutomaticamente, definirCarregadoAutomaticamente] = useState(false);

  const carregar = useCallback(async (abrirAutomaticamente = false) => {
    if (usuario?.role !== "medico") {
      definirPendentes([]);
      return;
    }
    try {
      const agora = Date.now();
      const recebidas = await listarAutorizacoesPendentes();
      const validas = recebidas.filter((item) => {
        const criada = new Date(item.criadoEm).getTime();
        return Number.isFinite(criada) && agora - criada >= 0 && agora - criada <= PRAZO_AUTORIZACAO;
      });
      definirPendentes(validas);
      if (abrirAutomaticamente && validas.length) definirModalVisivel(true);
    } catch {
      definirPendentes([]);
    }
  }, [usuario]);

  useEffect(() => {
    if (!usuario || carregadoAutomaticamente) return;
    definirCarregadoAutomaticamente(true);
    carregar(true);
  }, [carregadoAutomaticamente, carregar, usuario]);

  const responder = useCallback(async (confirmar) => {
    const atual = pendentes[0];
    if (!atual) return definirModalVisivel(false);
    try {
      definirCarregando(true);
      if (confirmar) await confirmarAutorizacao(atual.id);
      else await cancelarAutorizacao(atual.id);
      const restantes = pendentes.slice(1);
      definirPendentes(restantes);
      if (!restantes.length) definirModalVisivel(false);
      Alert.alert("Autorização", confirmar ? "Vínculo confirmado com sucesso." : "Solicitação recusada.");
    } catch (erro) {
      Alert.alert("Autorização", erro.message || "Não foi possível responder à solicitação.");
    } finally {
      definirCarregando(false);
    }
  }, [pendentes]);

  const valor = useMemo(() => ({
    quantidadePendentes: pendentes.length,
    abrirAutorizacoes: async () => {
      await carregar(false);
      definirModalVisivel(true);
    },
  }), [carregar, pendentes.length]);

  const atual = pendentes[0];

  return (
    <ContextoAutorizacao.Provider value={valor}>
      {children}
      <Modal visible={modalVisivel} transparent animationType="fade" onRequestClose={() => definirModalVisivel(false)}>
        <View className="flex-1 items-center justify-center bg-black/40 p-5">
          <View className="w-full max-w-[520px] rounded-3xl bg-white p-6">
            <View className="mb-5 flex-row items-center justify-between">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-mint-100">
                <Ionicons name="notifications-outline" size={25} color="#357257" />
              </View>
              <Pressable onPress={() => definirModalVisivel(false)} accessibilityLabel="Fechar notificações">
                <Ionicons name="close" size={24} color="#64748B" />
              </Pressable>
            </View>
            {atual ? (
              <>
                <Text className="text-2xl font-black text-ink">Autorizar vínculo?</Text>
                <Text className="mt-2 leading-6 text-slate-600">
                  {atual.donoNome}, da unidade {atual.unidadeNome}, enviou uma solicitação para adicionar você ao corpo clínico.
                </Text>
                <View className="my-5 rounded-2xl bg-mint-50 p-4">
                  <Text className="font-black text-ink">Contrato da unidade</Text>
                  <Text className="mt-1 text-sm text-slate-500">{atual.contratoNome}</Text>
                  {atual.contratoUrl ? (
                    <Pressable onPress={() => Linking.openURL(atual.contratoUrl)} className="mt-3 self-start">
                      <Text className="font-bold text-mint-700">Abrir contrato</Text>
                    </Pressable>
                  ) : null}
                </View>
                <Text className="mb-5 text-sm text-amber-700">A solicitação expira 10 minutos após o envio.</Text>
                <View className="gap-3">
                  <BotaoPrimario titulo="Confirmar autorização" aoPressionar={() => responder(true)} carregando={carregando} />
                  <BotaoPrimario titulo="Cancelar autorização" variante="secondary" aoPressionar={() => responder(false)} desabilitado={carregando} />
                </View>
              </>
            ) : (
              <>
                <Text className="text-2xl font-black text-ink">Notificações</Text>
                <Text className="mt-3 text-slate-500">Nenhuma autorização pendente ou dentro do prazo.</Text>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ContextoAutorizacao.Provider>
  );
}

export function usarAutorizacoes() {
  const contexto = useContext(ContextoAutorizacao);
  if (!contexto) throw new Error("usarAutorizacoes deve ser usado dentro de ProvedorAutorizacao");
  return contexto;
}
