import React, { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";

import Screen from "../../components/Screen";
import AppInput from "../../components/AppInput";
import PrimaryButton from "../../components/PrimaryButton";
import { useAuth } from "../../contexts/AuthContext";
import { createDiagnosis, listDiagnosisGroups } from "../../services/diagnosisService";
import { getClinic } from "../../services/clinicService";

export default function CreateDiagnosisScreen() {
  const { user } = useAuth();

  const [clinic, setClinic] = useState(null);
  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [medicines, setMedicines] = useState("");

  useEffect(() => {
    async function init() {
      const [clinicData, groupData] = await Promise.all([
        getClinic(),
        listDiagnosisGroups()
      ]);

      setClinic(clinicData);
      setGroups(groupData);
      setGroupId(groupData[0]?.id || "");
    }

    init();
  }, []);

  async function handleCreate() {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Diagnóstico", "Preencha título e descrição.");
      return;
    }

    await createDiagnosis({
      groupId,
      title: title.trim(),
      description: description.trim(),
      medicines: medicines.trim() || "Sem medicamentos informados.",
      doctor: user.name,
      clinic: clinic?.name || "Unidade não informada"
    });

    setTitle("");
    setDescription("");
    setMedicines("");

    Alert.alert("Sucesso", "Diagnóstico criado no mock.");
  }

  return (
    <Screen>
      <Text className="mt-2 text-3xl font-black text-ink">Novo diagnóstico</Text>
      <Text className="mt-2 leading-6 text-slate-500">
        O cabeçalho clínico é preenchido automaticamente a partir do médico e da unidade.
      </Text>

      <View className="my-5 overflow-hidden rounded-[28px] border border-mint-100 bg-white">
        <View className="flex-row border-b border-mint-100">
          <View className="w-1/3 items-center justify-center bg-mint-50 p-4">
            <View className="h-16 w-16 items-center justify-center rounded-2xl bg-mint-200">
              <Text className="font-black text-mint-800">LOGO</Text>
            </View>
          </View>

          <View className="flex-1 justify-center p-4">
            <Text className="text-lg font-black text-ink">
              {clinic?.name || "Carregando unidade..."}
            </Text>
            <Text className="mt-1 text-sm text-slate-500">{clinic?.address}</Text>
            <Text className="text-sm text-slate-500">{clinic?.phone}</Text>
          </View>
        </View>

        <View className="bg-mint-50 px-4 py-3">
          <Text className="text-center text-xl font-bold text-ink">
            Laudo / Diagnóstico
          </Text>
        </View>

        <View className="p-4">
          <Text className="font-bold text-ink">Médico: {user.name}</Text>
          <Text className="mt-1 text-slate-500">
            CRM: {user.crm || "não informado"}
          </Text>
        </View>
      </View>

      <Text className="mb-2 font-semibold text-ink">Grupo</Text>
      <View className="mb-4 overflow-hidden rounded-2xl border border-mint-200 bg-white">
        <Picker selectedValue={groupId} onValueChange={setGroupId}>
          {groups.map((group) => (
            <Picker.Item key={group.id} label={group.name} value={group.id} />
          ))}
        </Picker>
      </View>

      <AppInput label="Título do diagnóstico" value={title} onChangeText={setTitle} placeholder="Ex.: Acompanhamento neurológico" />

      <AppInput
        label="Descrição"
        value={description}
        onChangeText={setDescription}
        placeholder="Descreva os achados, avaliação e conclusão..."
        multiline
        textAlignVertical="top"
        className="min-h-[150px]"
      />

      <AppInput
        label="Medicamentos"
        value={medicines}
        onChangeText={setMedicines}
        placeholder="Medicamento, dose e orientação..."
        multiline
        textAlignVertical="top"
        className="min-h-[110px]"
      />

      <PrimaryButton title="Salvar diagnóstico" onPress={handleCreate} />

      <Text className="mt-4 text-xs leading-5 text-slate-400">
        Este formulário foi inspirado na organização visual do laudo anexado:
        cabeçalho da unidade, identificação do profissional e corpo principal do laudo.
        Em produção, campos obrigatórios e assinatura devem seguir os requisitos jurídicos
        e clínicos do seu sistema.
      </Text>
    </Screen>
  );
}
