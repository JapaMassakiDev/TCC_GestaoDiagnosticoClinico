import React, { useCallback, useEffect, useState } from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

import Screen from "../../components/Screen";
import AppInput from "../../components/AppInput";
import PrimaryButton from "../../components/PrimaryButton";
import {
  addDoctorByCpf,
  getClinic,
  getClinicStats,
  removeDoctor,
  updateClinic
} from "../../services/clinicService";
import { maskCPF, onlyDigits } from "../../utils/masks";

function Kpi({ label, value, icon }) {
  return (
    <View className="min-w-[47%] flex-1 rounded-3xl border border-mint-100 bg-white p-4">
      <Ionicons name={icon} size={24} color="#3F8F68" />
      <Text className="mt-4 text-3xl font-black text-ink">{value}</Text>
      <Text className="mt-1 text-sm text-slate-500">{label}</Text>
    </View>
  );
}

export default function ManagementScreen() {
  const [clinic, setClinic] = useState(null);
  const [stats, setStats] = useState(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [logoUri, setLogoUri] = useState(null);
  const [doctorCpf, setDoctorCpf] = useState("");

  const load = useCallback(async () => {
    const [clinicData, statsData] = await Promise.all([
      getClinic(),
      getClinicStats()
    ]);

    setClinic(clinicData);
    setStats(statsData);
    setName(clinicData.name || "");
    setAddress(clinicData.address || "");
    setLogoUri(clinicData.logoUri || null);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function selectLogo() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permissão", "Autorize o acesso às imagens para selecionar a logo.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
    });

    if (!result.canceled) {
      setLogoUri(result.assets[0].uri);
    }
  }

  async function saveClinic() {
    await updateClinic({ name, address, logoUri });
    Alert.alert("Unidade", "Dados salvos no mock.");
    load();
  }

  async function addDoctor() {
    try {
      if (onlyDigits(doctorCpf).length !== 11) {
        Alert.alert("CPF", "Digite o CPF do médico.");
        return;
      }

      await addDoctorByCpf(doctorCpf);
      setDoctorCpf("");
      load();
    } catch (error) {
      Alert.alert("Médico", error.message);
    }
  }

  async function deleteDoctor(id) {
    await removeDoctor(id);
    load();
  }

  return (
    <Screen>
      <Text className="mt-2 text-3xl font-black text-ink">Gestão da unidade</Text>
      <Text className="mt-2 leading-6 text-slate-500">
        Cadastre a unidade, vincule médicos e acompanhe os principais números.
      </Text>

      <View className="my-5 flex-row flex-wrap gap-3">
        <Kpi label="Consultas realizadas" value={stats?.totalAppointments ?? "-"} icon="checkmark-done-outline" />
        <Kpi label="Consultas no mês" value={stats?.thisMonth ?? "-"} icon="calendar-outline" />
        <Kpi label="Médicos ativos" value={stats?.activeDoctors ?? "-"} icon="people-outline" />
      </View>

      <View className="mb-5 rounded-[28px] border border-mint-100 bg-white p-5">
        <Text className="mb-4 text-xl font-extrabold text-ink">Dados da unidade</Text>

        <Pressable
          onPress={selectLogo}
          className="mb-5 h-28 items-center justify-center overflow-hidden rounded-3xl border border-dashed border-mint-300 bg-mint-50"
        >
          {logoUri ? (
            <Image source={{ uri: logoUri }} className="h-full w-full" resizeMode="contain" />
          ) : (
            <>
              <Ionicons name="image-outline" size={30} color="#3F8F68" />
              <Text className="mt-2 font-semibold text-mint-700">Anexar logo</Text>
            </>
          )}
        </Pressable>

        <AppInput label="Nome da unidade" value={name} onChangeText={setName} placeholder="Clínica Vida Verde" />
        <AppInput label="Endereço completo" value={address} onChangeText={setAddress} placeholder="Rua, número, bairro, cidade/UF" />

        <PrimaryButton title="Salvar unidade" onPress={saveClinic} />
      </View>

      <View className="rounded-[28px] border border-mint-100 bg-white p-5">
        <Text className="text-xl font-extrabold text-ink">Médicos vinculados</Text>
        <Text className="mb-4 mt-1 text-sm text-slate-500">
          No mock, use o CPF 987.654.321-00.
        </Text>

        <AppInput
          label="CPF do médico"
          value={doctorCpf}
          onChangeText={(value) => setDoctorCpf(maskCPF(value))}
          keyboardType="numeric"
          maxLength={14}
          placeholder="000.000.000-00"
        />

        <PrimaryButton title="Adicionar médico" onPress={addDoctor} variant="secondary" />

        <View className="mt-5">
          {clinic?.doctorObjects?.map((doctor) => (
            <View
              key={doctor.id}
              className="mb-3 flex-row items-center rounded-2xl bg-mint-50 p-4"
            >
              <View className="h-11 w-11 items-center justify-center rounded-full bg-mint-200">
                <Ionicons name="person" size={21} color="#357257" />
              </View>

              <View className="ml-3 flex-1">
                <Text className="font-bold text-ink">{doctor.name}</Text>
                <Text className="text-sm text-slate-500">CRM {doctor.crm}</Text>
              </View>

              <Pressable onPress={() => deleteDoctor(doctor.id)} className="p-2">
                <Ionicons name="trash-outline" size={22} color="#C15A5A" />
              </Pressable>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}
