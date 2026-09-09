import React, { useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Screen from "../../components/Screen";
import AppInput from "../../components/AppInput";
import CpfInput from "../../components/CpfInput";
import DateSelectField from "../../components/DateSelectField";
import SexSelector from "../../components/SexSelector";
import PrimaryButton from "../../components/PrimaryButton";
import UnitLocationFields from "../../components/UnitLocationFields";
import { findCep, validateCepAddress } from "../../services/cepService";
import { useAuth } from "../../contexts/AuthContext";
import { checkCpf } from "../../services/authService";
import {
  brDateToIso,
  isPastOrTodayDateBr,
  isValidDateBr,
  maskCNPJ,
  maskCPF,
  maskCRM,
  maskPhone,
  onlyDigits,
} from "../../utils/masks";

export default function ProfileScreen() {
  const { user, saveProfile, signOut } = useAuth();
  const [editVisible, setEditVisible] = useState(false);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  
  const ownerUnit = useMemo(
    () => (user.role === "dono" && user.unitName ? { name: user.unitName, cnpj: user.cnpj, cep: user.cep, address: user.address, number: user.number, phone: user.unitPhone, logoUri: user.logoUri } : null),
    [user]
  );

  function openEdit() {
    setErrors({});
    setForm({
      name: user.name || "",
      email: user.email || "",
      cpf: maskCPF(user.cpf || ""),
      password: "",
      phone: maskPhone(user.phone || ownerUnit?.phone || ""),
      sex: user.sex || "",
      birthDate: user.birthDate ? user.birthDate.split("-").reverse().join("/") : "",
      crm: maskCRM(user.crm || ""),
      cnpj: maskCNPJ(user.cnpj || ownerUnit?.cnpj || ""),
      unitName: ownerUnit?.name || "",
      cep: ownerUnit?.cep || "",
      address: ownerUnit?.address || "",
      number: ownerUnit?.number || "",
      logoUri: ownerUnit?.logoUri || null,
    });
    setEditVisible(true);
  }

  async function pickLogo() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setForm((current) => ({ ...current, logoUri: result.assets[0].uri }));
  }

  async function save() {
    const nextErrors = {};
    const cpfDigits = onlyDigits(form.cpf);

    if (!form.name?.trim()) nextErrors.name = "Informe seu nome completo.";
    if (!form.email?.trim()) nextErrors.email = "Informe seu e-mail.";
    if (cpfDigits.length !== 11) nextErrors.cpf = "CPF incompleto. Preencha os 11 números.";
    if (form.password && form.password.length < 6) nextErrors.password = "A nova senha deve ter no mínimo 6 caracteres.";

    if (cpfDigits.length === 11 && cpfDigits !== user.cpf) {
      const result = await checkCpf(cpfDigits);
      if (result.exists) nextErrors.cpf = "Este CPF já pertence a outro cadastro.";
    }

    if (user.role === "paciente") {
      if (!form.sex) nextErrors.sex = "Selecione o sexo.";
      else if (form.sex === "Outro") nextErrors.sex = "Escreva sua identificação no campo Outro.";
      if (onlyDigits(form.phone).length < 10) nextErrors.phone = "Informe um telefone válido.";
      if (!isValidDateBr(form.birthDate)) nextErrors.birthDate = "Informe uma data de nascimento válida.";
      else if (!isPastOrTodayDateBr(form.birthDate)) nextErrors.birthDate = "A data de nascimento não pode estar no futuro.";
    }

    if (user.role === "medico" && onlyDigits(form.crm).length < 4) {
      nextErrors.crm = "Informe o CRM do médico.";
    }

    if (user.role === "dono") {
      if (onlyDigits(form.cnpj).length !== 14) nextErrors.cnpj = "Informe os 14 números do CNPJ.";
      if (!form.unitName?.trim()) nextErrors.unitName = "Informe o nome da unidade.";
      if (onlyDigits(form.cep).length !== 8) nextErrors.cep = "Informe e selecione um CEP válido.";
      else if (!(await findCep(form.cep))) nextErrors.cep = "CEP não localizado.";
      if (!form.address?.trim()) nextErrors.address = "Informe o endereço da unidade.";
      if (!form.number?.trim()) nextErrors.number = "Informe o número da unidade.";
      if (onlyDigits(form.phone).length < 10) nextErrors.phone = "Informe o telefone da unidade.";
      if (!nextErrors.cep && !nextErrors.address) {
        const coherence = await validateCepAddress(form.cep, form.address);
        if (!coherence.valid) nextErrors.address = coherence.reason;
      }
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        cpf: form.cpf,
      };
      if (form.password) payload.password = form.password;

      if (user.role === "paciente") {
        payload.sex = form.sex;
        payload.phone = form.phone;
        payload.birthDate = brDateToIso(form.birthDate);
      }
      if (user.role === "medico") payload.crm = form.crm;
      if (user.role === "dono") {
        payload.cnpj = form.cnpj;
        payload.unitName = form.unitName.trim();
        payload.cep = form.cep;
        payload.address = form.address.trim();
        payload.number = form.number.trim();
        payload.phone = form.phone;
        payload.logoUri = form.logoUri;
      }

      await saveProfile(payload);
      setEditVisible(false);
      Alert.alert("Perfil", "Informações atualizadas no mock.");
    } catch (error) {
      Alert.alert("Perfil", error.message);
    }
  }

  return (
    <Screen>
      <View className="mx-auto w-full max-w-[560px]">
        <View className="mt-8 items-center">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-mint-200">
            <Ionicons name="person" size={46} color="#357257" />
          </View>
          <Text className="mt-5 text-2xl font-black text-ink">{user.name}</Text>
          <Text className="mt-1 capitalize text-mint-700">{user.role}</Text>
        </View>

        <View className="my-7 rounded-3xl border border-mint-100 bg-white p-5 hover:shadow-xl transition-all duration-200">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-black text-ink">Informações</Text>
            <Pressable onPress={openEdit} accessibilityLabel="Editar perfil" className="h-10 w-10 items-center justify-center rounded-full bg-mint-50">
              <Ionicons name="pencil" size={19} color="#357257" />
            </Pressable>
          </View>
          <Text className="text-xs font-bold uppercase text-slate-400">E-mail</Text><Text className="mt-1 text-base text-ink">{user.email}</Text>
          <Text className="mt-5 text-xs font-bold uppercase text-slate-400">CPF</Text><Text className="mt-1 text-base text-ink">{maskCPF(user.cpf)}</Text>
          {user.role === "paciente" ? <>
            <Text className="mt-5 text-xs font-bold uppercase text-slate-400">Sexo</Text><Text className="mt-1 text-base text-ink">{user.sex || "-"}</Text>
            <Text className="mt-5 text-xs font-bold uppercase text-slate-400">Telefone</Text><Text className="mt-1 text-base text-ink">{maskPhone(user.phone || "") || "-"}</Text>
            <Text className="mt-5 text-xs font-bold uppercase text-slate-400">Nascimento</Text><Text className="mt-1 text-base text-ink">{user.birthDate ? user.birthDate.split("-").reverse().join("/") : "-"}</Text>
          </> : null}
          {user.role === "medico" ? <><Text className="mt-5 text-xs font-bold uppercase text-slate-400">CRM</Text><Text className="mt-1 text-base text-ink">{user.crm || "-"}</Text></> : null}
          {ownerUnit ? <>
            <Text className="mt-5 text-xs font-bold uppercase text-slate-400">CNPJ</Text><Text className="mt-1 text-base text-ink">{maskCNPJ(ownerUnit.cnpj || user.cnpj || "")}</Text>
            <Text className="mt-5 text-xs font-bold uppercase text-slate-400">Unidade</Text><Text className="mt-1 text-base text-ink">{ownerUnit.name}</Text>
            <Text className="mt-5 text-xs font-bold uppercase text-slate-400">CEP</Text><Text className="mt-1 text-base text-ink">{ownerUnit.cep || "-"}</Text>
            <Text className="mt-2 text-sm text-slate-500">{ownerUnit.address}{ownerUnit.number ? `, ${ownerUnit.number}` : ""}</Text><Text className="text-sm text-slate-500">{ownerUnit.phone}</Text>
          </> : null}
        </View>
        <PrimaryButton title="Sair" variant="secondary" onPress={signOut} />
      </View>

      <Modal visible={editVisible} transparent animationType="fade" onRequestClose={() => setEditVisible(false)}>
        <View className="flex-1 items-center justify-center bg-black/40 p-5">
          <ScrollView className="max-h-[90%] w-full max-w-[620px] rounded-3xl bg-white hover:shadow-xl transition-all duration-200">
            <View className="p-6">
              <View className="mb-5 flex-row items-center justify-between">
                <Text className="text-2xl font-black text-ink">Editar perfil</Text>
                <Pressable onPress={() => setEditVisible(false)}><Ionicons name="close" size={24} color="#64748B" /></Pressable>
              </View>

              <AppInput label="Nome completo" value={form.name || ""} onChangeText={(v) => { setForm((f) => ({ ...f, name: v })); setErrors((e) => ({ ...e, name: "" })); }} autoCapitalize="words" error={errors.name} />
              <AppInput label="E-mail" value={form.email || ""} onChangeText={(v) => { setForm((f) => ({ ...f, email: v })); setErrors((e) => ({ ...e, email: "" })); }} keyboardType="email-address" inputMode="email" autoCapitalize="none" error={errors.email} />
              <CpfInput label="CPF" value={form.cpf || ""} onChangeText={(v) => { setForm((f) => ({ ...f, cpf: v })); setErrors((e) => ({ ...e, cpf: "" })); }} error={errors.cpf} />

              {user.role === "paciente" ? <>
                <SexSelector
                  value={form.sex || ""}
                  onChange={(v) => { setForm((f) => ({ ...f, sex: v })); setErrors((e) => ({ ...e, sex: "" })); }}
                  error={errors.sex}
                />
                <AppInput label="Telefone" value={form.phone || ""} onChangeText={(v) => { setForm((f) => ({ ...f, phone: maskPhone(v) })); setErrors((e) => ({ ...e, phone: "" })); }} keyboardType="phone-pad" inputMode="tel" maxLength={15} error={errors.phone} />
                <DateSelectField
                  label="Data de nascimento"
                  value={form.birthDate || ""}
                  onChange={(v) => { setForm((f) => ({ ...f, birthDate: v })); setErrors((e) => ({ ...e, birthDate: "" })); }}
                  maxYear={new Date().getFullYear()}
                  maximumDate={new Date()}
                  error={errors.birthDate}
                />
              </> : null}

              {user.role === "medico" ? <AppInput label="CRM" value={form.crm || ""} onChangeText={(v) => { setForm((f) => ({ ...f, crm: maskCRM(v) })); setErrors((e) => ({ ...e, crm: "" })); }} keyboardType="numeric" inputMode="numeric" maxLength={6} error={errors.crm} /> : null}

              {user.role === "dono" ? <>
                <View className="mb-2 mt-2 rounded-2xl bg-mint-50 p-4">
                  <Text className="mb-4 font-black text-mint-800">Dados da unidade</Text>
                  <AppInput label="CNPJ" value={form.cnpj || ""} onChangeText={(v) => { setForm((f) => ({ ...f, cnpj: maskCNPJ(v) })); setErrors((e) => ({ ...e, cnpj: "" })); }} keyboardType="numeric" inputMode="numeric" maxLength={18} error={errors.cnpj} />
                  <AppInput label="Nome da unidade" value={form.unitName || ""} onChangeText={(v) => { setForm((f) => ({ ...f, unitName: v })); setErrors((e) => ({ ...e, unitName: "" })); }} error={errors.unitName} />
                  <UnitLocationFields
                    cep={form.cep || ""}
                    address={form.address || ""}
                    number={form.number || ""}
                    phone={form.phone || ""}
                    onCepChange={(value) => {
                      setForm((f) => ({ ...f, cep: value }));
                      setErrors((e) => ({ ...e, cep: "", address: "" }));
                    }}
                    onAddressChange={(value) => {
                      setForm((f) => ({ ...f, address: value }));
                      setErrors((e) => ({ ...e, address: "" }));
                    }}
                    onNumberChange={(value) => {
                      setForm((f) => ({ ...f, number: onlyDigits(value).slice(0, 8) }));
                      setErrors((e) => ({ ...e, number: "" }));
                    }}
                    onPhoneChange={(value) => {
                      setForm((f) => ({ ...f, phone: value }));
                      setErrors((e) => ({ ...e, phone: "" }));
                    }}
                    onLocationSelect={(item) => {
                      setForm((f) => ({ ...f, cep: item.cep, address: item.formattedAddress }));
                      setErrors((e) => ({ ...e, cep: "", address: "" }));
                    }}
                    cepError={errors.cep}
                    addressError={errors.address}
                    numberError={errors.number}
                    phoneError={errors.phone}
                  />
                  <Text className="mb-2 font-semibold text-ink">Logo da unidade</Text>
                  <Pressable onPress={pickLogo} className="mb-4 items-center rounded-2xl border border-dashed border-mint-300 bg-white p-4">
                    {form.logoUri ? <Image source={{ uri: form.logoUri }} className="mb-2 h-20 w-20 rounded-2xl" resizeMode="contain" /> : null}
                    <Text className="font-bold text-mint-700">{form.logoUri ? "Trocar logo" : "Anexar logo"}</Text>
                  </Pressable>
                </View>
              </> : null}

              <AppInput label="Nova senha (opcional)" value={form.password || ""} onChangeText={(v) => { setForm((f) => ({ ...f, password: v })); setErrors((e) => ({ ...e, password: "" })); }} secureTextEntry placeholder="Deixe em branco para manter a atual" error={errors.password} />

              <View className="gap-3">
                <PrimaryButton title="Salvar alterações" onPress={save} loading={loading} />
                <PrimaryButton title="Cancelar" variant="secondary" onPress={() => setEditVisible(false)} />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </Screen>
  );
}
