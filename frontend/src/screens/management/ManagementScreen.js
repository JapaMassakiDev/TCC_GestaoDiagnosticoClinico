import React, { useCallback, useState } from "react";
import { Alert, Modal, Pressable, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Screen from "../../components/Screen";
import AppInput from "../../components/AppInput";
import PrimaryButton from "../../components/PrimaryButton";
import { useAuth } from "../../contexts/AuthContext";
import {
  addDoctorToUnit,
  getOwnerDashboard,
  removeDoctorFromUnit,
} from "../../services/managementService";
import { maskCRM, maskPhone } from "../../utils/masks";

export default function ManagementScreen() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [modal, setModal] = useState(false);
  const [crm, setCrm] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await getOwnerDashboard(user.id));
    } catch (error) {
      Alert.alert("Gestão", error.message);
    }
  }, [user.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function add() {
    try {
      setLoading(true);
      await addDoctorToUnit(user.id, crm);
      setCrm("");
      setModal(false);
      await load();
    } catch (error) {
      Alert.alert("CRM", error.message);
    } finally {
      setLoading(false);
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
              await removeDoctorFromUnit(user.id, doc.id);
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
      <Screen>
        <Text>Carregando...</Text>
      </Screen>
    );
  }

  return (
    <Screen>
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
            {data.unit?.number ? `, ${data.unit.number}` : ""} · {maskPhone(data.unit?.phone || "")}
          </Text>
        </View>

        <View className="mt-5 rounded-3xl border border-mint-100 bg-white p-5 hover:shadow-xl transition-all duration-200">
          <View className="mb-5 flex-row items-center justify-between">
            <View>
              <Text className="text-xl font-black text-ink">Médicos adicionados</Text>
              <Text className="mt-1 text-slate-500">Adicionar ou remover vínculos sem apagar histórico.</Text>
            </View>
            <Pressable onPress={() => setModal(true)} className="rounded-xl bg-mint-600 px-4 py-3">
              <Text className="font-bold text-white">+ Adicionar</Text>
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
              <Pressable onPress={() => remove(doc)} className="rounded-xl bg-white px-3 py-2">
                <Text className="font-bold text-red-500">Excluir</Text>
              </Pressable>
            </View>
          ))}

          {!data.doctors.length ? (
            <Text className="py-6 text-center text-slate-400">Nenhum médico vinculado.</Text>
          ) : null}
        </View>
      </View>

      <Modal transparent animationType="fade" visible={modal} onRequestClose={() => setModal(false)}>
        <View className="flex-1 items-center justify-center bg-black/30 p-5">
          <View className="w-full max-w-[460px] rounded-3xl bg-white p-6 hover:shadow-xl transition-all duration-200">
            <Text className="text-2xl font-black text-ink">Adicionar médico</Text>
            <Text className="mb-5 mt-2 text-slate-500">Informe o CRM de um médico já cadastrado.</Text>
            <AppInput
              label="CRM"
              value={crm}
              onChangeText={(value) => setCrm(maskCRM(value))}
              keyboardType="numeric"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
            />
            <View className="gap-3">
              <PrimaryButton title={loading ? "Adicionando..." : "Adicionar médico"} onPress={add} disabled={loading} />
              <PrimaryButton title="Cancelar" variant="secondary" onPress={() => setModal(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
