import React, { useCallback, useState } from "react";
import { Alert, Modal, Pressable, Text, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useFocusEffect } from "@react-navigation/native";
import Tela from "../../components/Tela";
import CampoApp from "../../components/CampoApp";
import BotaoPrimario from "../../components/BotaoPrimario";
import { usarAutenticacao } from "../../contexts/AuthenticationContext";
import {
  adicionarMedicoUnidade,
  buscarMedicoPorCrm,
  enviarAutorizacaoMedico,
  obterPainelProprietario,
  removerMedicoUnidade,
} from "../../services/managementService";
import { mascararCrm, mascararTelefone, somenteDigitos } from "../../utils/masks";

export default function TelaGestao() {
  const { usuario } = usarAutenticacao();
  const { width: largura } = useWindowDimensions();
  const acoesCompactas = largura < 640;
  const [data, setData] = useState(null);
  const [modal, setModal] = useState(false);
  const [crm, setCrm] = useState("");
  const [carregando, definirCarregando] = useState(false);
  const [medicoEncontrado, definirMedicoEncontrado] = useState(null);
  const [medicoSelecionado, definirMedicoSelecionado] = useState(null);
  const [contrato, definirContrato] = useState(null);

  const load = useCallback(async () => {
    try {
      setData(await obterPainelProprietario(usuario.id));
    } catch (error) {
      Alert.alert("Gestão", error.message);
    }
  }, [usuario.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function limparFormulario() {
    setCrm("");
    definirMedicoEncontrado(null);
    definirMedicoSelecionado(null);
    definirContrato(null);
  }

  function fecharModal() {
    limparFormulario();
    setModal(false);
  }

  async function buscarMedico() {
    try {
      definirCarregando(true);
      definirMedicoEncontrado(await buscarMedicoPorCrm(crm));
    } catch (error) {
      Alert.alert("CRM", error.message);
    } finally {
      definirCarregando(false);
    }
  }

  async function selecionarMedico(medico) {
    const cpfMedico = somenteDigitos(medico.cpf);
    const cpfDono = somenteDigitos(usuario.cpf);
    if (cpfMedico && cpfDono && cpfMedico === cpfDono) {
      try {
        definirCarregando(true);
        await adicionarMedicoUnidade(usuario.id, medico.crm, medico.id);
        fecharModal();
        await load();
        Alert.alert("Gestão", "Médico vinculado diretamente à própria unidade.");
      } catch (error) {
        Alert.alert("Gestão", error.message);
      } finally {
        definirCarregando(false);
      }
      return;
    }
    definirMedicoSelecionado(medico);
  }

  async function anexarContrato() {
    const resultado = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (!resultado.canceled) definirContrato(resultado.assets[0]);
  }

  async function enviarAutorizacao() {
    if (!contrato) return Alert.alert("Contrato", "Anexe o contrato em PDF ou imagem.");
    try {
      definirCarregando(true);
      await enviarAutorizacaoMedico({ proprietarioId: usuario.id, medico: medicoSelecionado, contrato });
      fecharModal();
      Alert.alert("Autorização enviada", "O médico terá 10 minutos para confirmar ou cancelar a solicitação.");
    } catch (error) {
      Alert.alert("Autorização", error.message);
    } finally {
      definirCarregando(false);
    }
  }

  function remove(doc) {
    Alert.alert(
      "Excluir vínculo",
      `Deseja desvincular ${doc.name} desta unidade? O histórico de consultas será preservado.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Desvincular",
          style: "destructive",
          onPress: async () => {
            try {
              await removerMedicoUnidade(usuario.id, doc.id);
              await load();
            } catch (error) {
              Alert.alert("Gestão", error.message);
            }
          },
        },
      ],
    );
  }

  if (!data) {
    return (
      <Tela>
        <Text>Carregando...</Text>
      </Tela>
    );
  }

  return (
    <Tela>
      <View className="mx-auto w-full max-w-[1000px]">
        <Text className="mt-2 text-3xl font-black text-ink">Gestão</Text>
        <Text className="mt-2 text-slate-500">
          Indicadores da unidade e gerenciamento do corpo clínico por CRM.
        </Text>

        <View className="mt-6 flex-row flex-wrap gap-4">
          <View className="min-w-[220px] flex-1 rounded-3xl bg-mint-600 p-5 hover:shadow-xl transition-all duration-200">
            <Text className="text-sm font-bold uppercase text-mint-100">Consultas realizadas</Text>
            <Text className="mt-2 text-4xl font-black text-white">{data.totalConsultations}</Text>
            <Text className="mt-1 text-mint-100">Total da unidade</Text>
          </View>
          <View className="min-w-[220px] flex-1 rounded-3xl border border-mint-100 bg-white p-5 hover:shadow-xl transition-all duration-200">
            <Text className="text-sm font-bold uppercase text-slate-400">Médicos vinculados</Text>
            <Text className="mt-2 text-4xl font-black text-ink">{data.doctors.length}</Text>
            <Text className="mt-1 text-slate-500">Corpo clínico ativo</Text>
          </View>
        </View>

        <View className="mt-5 rounded-3xl border border-mint-100 bg-white p-5 hover:shadow-xl transition-all duration-200">
          <Text className="text-xl font-black text-ink">{data.unit?.name}</Text>
          <Text className="mt-1 text-slate-500">
            {data.unit?.address}
            {data.unit?.number ? `, ${data.unit.number}` : ""} · {mascararTelefone(data.unit?.phone || "")}
          </Text>
        </View>

        <View className="mt-5 rounded-3xl border border-mint-100 bg-white p-5 hover:shadow-xl transition-all duration-200">
          <View className="mb-5 flex-row items-start justify-between gap-3">
            <View className="min-w-0 flex-1 pr-1">
              <Text className="text-xl font-black text-ink">Médicos adicionados</Text>
              <Text className="mt-1 text-slate-500">Adicionar ou remover vínculos sem apagar histórico.</Text>
            </View>
            <Pressable
              onPress={() => setModal(true)}
              accessibilityLabel="Adicionar médico"
              className="shrink-0 flex-row items-center justify-center rounded-xl bg-mint-600 px-3 py-2"
            >
              <Ionicons name="person-add-outline" size={20} color="#FFFFFF" />
              {!acoesCompactas ? <Text className="ml-2 font-bold text-white">Adicionar</Text> : null}
            </Pressable>
          </View>

          {data.doctors.map((doc) => (
            <View
              key={doc.id}
              className="mb-3 flex-row items-center justify-between rounded-2xl bg-mint-50 p-4 hover:shadow-xl transition-all duration-200"
            >
              <View className="flex-1">
                <Text className="font-black text-ink">{doc.name}</Text>
                <Text className="mt-1 text-sm text-slate-500">
                  CRM {doc.crm} · {doc.diagnosisCount} consulta(s)
                </Text>
              </View>
              <Pressable
                onPress={() => remove(doc)}
                accessibilityLabel={`Excluir vínculo de ${doc.name}`}
                className="flex-row items-center justify-center rounded-xl bg-white px-3 py-2"
              >
                <Ionicons name="trash-outline" size={19} color="#EF4444" />
                {!acoesCompactas ? <Text className="ml-2 font-bold text-red-500">Excluir</Text> : null}
              </Pressable>
            </View>
          ))}

          {!data.doctors.length ? (
            <Text className="py-6 text-center text-slate-400">Nenhum médico vinculado.</Text>
          ) : null}
        </View>
      </View>

      <Modal transparent animationType="fade" visible={modal} onRequestClose={fecharModal}>
        <View className="flex-1 items-center justify-center bg-black/30 p-5">
          <View className="w-full max-w-[520px] rounded-3xl bg-white p-6 hover:shadow-xl transition-all duration-200">
            <Text className="text-2xl font-black text-ink">Adicionar médico</Text>
            <Text className="mb-5 mt-2 text-slate-500">Informe o CRM de um médico já cadastrado.</Text>
            <CampoApp
              rotulo="CRM"
              valor={crm}
              aoAlterarTexto={(value) => { setCrm(mascararCrm(value)); definirMedicoEncontrado(null); definirMedicoSelecionado(null); definirContrato(null); }}
              keyboardType="numeric"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
            />
            {!medicoEncontrado ? <BotaoPrimario titulo="Buscar médico" icone="search-outline" aoPressionar={buscarMedico} carregando={carregando} /> : null}

            {medicoEncontrado ? (
              <Pressable onPress={() => selecionarMedico(medicoEncontrado)} disabled={carregando} className="mb-4 rounded-2xl border border-mint-200 bg-mint-50 p-4">
                <Text className="font-black text-ink">{medicoEncontrado.nome}</Text>
                <Text className="mt-1 text-sm text-slate-500">CRM {medicoEncontrado.crm}</Text>
                <Text className="mt-2 font-bold text-mint-700">Selecionar médico</Text>
              </Pressable>
            ) : null}

            {medicoSelecionado ? (
              <View className="mb-4 rounded-2xl border border-mint-100 p-4">
                <Text className="mb-2 font-black text-ink">Anexar contrato</Text>
                <Text className="mb-3 text-sm text-slate-500">Obrigatório para solicitar a autorização do médico. Formatos aceitos: PDF ou imagem.</Text>
                <Pressable onPress={anexarContrato} className="items-center rounded-2xl border border-dashed border-mint-300 bg-white p-4">
                  <Ionicons name={contrato ? "document-attach-outline" : "cloud-upload-outline"} size={28} color="#357257" />
                  <Text className="mt-2 text-center font-bold text-mint-700">{contrato?.name || "Selecionar contrato"}</Text>
                </Pressable>
                <View className="mt-4">
                  <BotaoPrimario titulo="Enviar autorização" icone="send-outline" aoPressionar={enviarAutorizacao} carregando={carregando} desabilitado={!contrato} />
                </View>
              </View>
            ) : null}

            <BotaoPrimario titulo="Cancelar" variante="secondary" aoPressionar={fecharModal} desabilitado={carregando} />
          </View>
        </View>
      </Modal>
    </Tela>
  );
}
