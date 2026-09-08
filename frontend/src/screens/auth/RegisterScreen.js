import React, { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Screen from "../../components/Screen";
import AppHeader from "../../components/AppHeader";
import AppInput from "../../components/AppInput";
import CpfInput from "../../components/CpfInput";
import DateSelectField from "../../components/DateSelectField";
import SexSelector from "../../components/SexSelector";
import PrimaryButton from "../../components/PrimaryButton";
import UnitLocationFields from "../../components/UnitLocationFields";
import { findCep, validateCepAddress } from "../../services/cepService";
import { useAuth } from "../../contexts/AuthContext";
import { checkCpf } from "../../services/authService";
import { maskCNPJ, maskCPF, maskCRM, maskPhone, brDateToIso, isPastOrTodayDateBr, isValidDateBr, onlyDigits } from "../../utils/masks";

function RoleOption({ active, icon, title, subtitle, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className={`min-w-[145px] flex-1 items-center rounded-2xl border p-4 ${
        active ? "border-mint-500 bg-mint-100" : "border-mint-100 bg-white"
      } hover:shadow-xl transition-all duration-200`}
    >
      <View
        className={`mb-2 h-11 w-11 items-center justify-center rounded-full ${
          active ? "bg-mint-600" : "bg-mint-50"
        }`}
      >
        <Ionicons name={icon} size={22} color={active ? "#FFFFFF" : "#357257"} />
      </View>
      <Text className={`font-black ${active ? "text-mint-800" : "text-ink"}`}>{title}</Text>
      <Text className="mt-1 text-center text-xs text-slate-500">{subtitle}</Text>
      {active ? (
        <View className="mt-2 h-5 w-5 items-center justify-center rounded-full bg-mint-600">
          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
        </View>
      ) : null}
    </Pressable>
  );
}

export default function RegisterScreen({ navigation, route }) {
  const { signUp, loading } = useAuth();
  const [role, setRole] = useState("paciente");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState(maskCPF(route.params?.cpf || ""));
  const [password, setPassword] = useState("");
  const [sex, setSex] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [crm, setCrm] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [unitName, setUnitName] = useState("");
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  const [number, setNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [logoUri, setLogoUri] = useState(null);
  const [cpfStatus, setCpfStatus] = useState("idle");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let active = true;
    const cleanCpf = onlyDigits(cpf);

    if (cleanCpf.length !== 11) {
      setCpfStatus("idle");
      return () => {
        active = false;
      };
    }

    setCpfStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const result = await checkCpf(cleanCpf);
        if (!active) return;
        setCpfStatus(result.exists ? "taken" : "available");
      } catch {
        if (active) setCpfStatus("idle");
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [cpf]);

  function changeCpf(value) {
    setCpf(value);
    setErrors((current) => ({ ...current, cpf: "" }));
  }

  function selectRole(nextRole) {
    setRole(nextRole);
    setErrors({});
  }

  async function pickLogo() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) setLogoUri(result.assets[0].uri);
  }

  async function submit() {
    const nextErrors = {};
    const cleanCpf = onlyDigits(cpf);

    if (!name.trim()) nextErrors.name = "Informe seu nome completo.";
    if (!email.trim()) nextErrors.email = "Informe seu e-mail.";
    if (cleanCpf.length !== 11) nextErrors.cpf = "CPF incompleto. Preencha os 11 números.";
    if (cpfStatus === "taken") nextErrors.cpf = "Este CPF já possui cadastro. Volte para o login.";
    if (password.length < 6) nextErrors.password = "A senha deve ter no mínimo 6 caracteres.";

    if (role === "paciente") {
      if (!sex.trim()) nextErrors.sex = "Informe o sexo.";
      else if (sex === "Outro") nextErrors.sex = "Escreva sua identificação no campo Outro.";
      if (onlyDigits(patientPhone).length < 10) nextErrors.patientPhone = "Informe o telefone do paciente.";
      if (onlyDigits(birthDate).length !== 8) nextErrors.birthDate = "Informe a data de nascimento completa.";
      else if (!isValidDateBr(birthDate)) nextErrors.birthDate = "Informe uma data de nascimento válida.";
      else if (!isPastOrTodayDateBr(birthDate)) nextErrors.birthDate = "A data de nascimento não pode estar no futuro.";
    }

    if (role === "medico" && onlyDigits(crm).length < 4) {
      nextErrors.crm = "Informe o CRM do médico.";
    }

    if (role === "dono") {
      if (onlyDigits(cnpj).length !== 14) nextErrors.cnpj = "Informe os 14 números do CNPJ.";
      if (!unitName.trim()) nextErrors.unitName = "Informe o nome da unidade.";
      if (onlyDigits(cep).length !== 8) nextErrors.cep = "Informe e selecione um CEP válido.";
      else if (!(await findCep(cep))) nextErrors.cep = "CEP não localizado.";
      if (!address.trim()) nextErrors.address = "Informe o endereço da unidade.";
      if (!number.trim()) nextErrors.number = "Informe o número da unidade.";
      if (onlyDigits(phone).length < 10) nextErrors.phone = "Informe o telefone da unidade.";

      if (!nextErrors.cep && !nextErrors.address) {
        const coherence = await validateCepAddress(cep, address);
        if (!coherence.valid) {
          nextErrors.address = coherence.reason;
        }
      }
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    try {
      await signUp({
        role,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        cpf,
        password,
        sex: role === "paciente" ? sex.trim() : undefined,
        phone: role === "paciente" ? patientPhone : role === "dono" ? phone : undefined,
        birthDate: role === "paciente" ? brDateToIso(birthDate) : undefined,
        crm: role === "medico" ? crm : undefined,
        cnpj: role === "dono" ? cnpj : undefined,
        unitName: role === "dono" ? unitName.trim() : undefined,
        cep: role === "dono" ? cep : undefined,
        address: role === "dono" ? address.trim() : undefined,
        number: role === "dono" ? number.trim() : undefined,
        logoUri: role === "dono" ? logoUri : undefined,
      });
    } catch (error) {
      setErrors((current) => ({ ...current, general: error.message }));
    }
  }

  const cpfError = errors.cpf || (cpfStatus === "taken" ? "Este CPF já está cadastrado." : "");

  return (
    <Screen>
      <View className="mx-auto w-full max-w-[720px]">
        <AppHeader
          title="Criar cadastro"
          subtitle="Escolha um dos três perfis e complete somente as informações necessárias."
          onBack={() => navigation.goBack()}
        />

        <Text className="mb-3 font-semibold text-ink">Selecione seu perfil</Text>
        <View className="mb-6 flex-row flex-wrap gap-3">
          <RoleOption
            active={role === "paciente"}
            icon="person-outline"
            title="Paciente"
            subtitle="Acompanhar diagnósticos"
            onPress={() => selectRole("paciente")}
          />
          <RoleOption
            active={role === "medico"}
            icon="medical-outline"
            title="Médico"
            subtitle="Diagnosticar pacientes"
            onPress={() => selectRole("medico")}
          />
          <RoleOption
            active={role === "dono"}
            icon="business-outline"
            title="Unidade"
            subtitle="Gerenciar médicos"
            onPress={() => selectRole("dono")}
          />
        </View>

        <View className="rounded-3xl border border-mint-100 bg-white p-5 hover:shadow-xl transition-all duration-200">
          <Text className="mb-5 text-lg font-black text-ink">Dados de acesso</Text>

          <AppInput
            label="Nome completo"
            value={name}
            onChangeText={(value) => {
              setName(value);
              setErrors((current) => ({ ...current, name: "" }));
            }}
            placeholder="Seu nome completo"
            error={errors.name}
          />

          <AppInput
            label="E-mail"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setErrors((current) => ({ ...current, email: "" }));
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            inputMode="email"
            placeholder="voce@email.com"
            error={errors.email}
          />

          <CpfInput
            label="CPF"
            value={cpf}
            onChangeText={changeCpf}
            error={cpfError}
            showCheck={cpfStatus === "available"}
          />

          {cpfStatus === "checking" ? (
            <Text className="-mt-2 mb-4 text-xs text-slate-400">Verificando CPF...</Text>
          ) : null}

          {cpfStatus === "available" ? (
            <Text className="-mt-2 mb-4 text-xs font-semibold text-mint-700">✓ CPF disponível para cadastro.</Text>
          ) : null}

          {role === "paciente" ? (
            <>
              <SexSelector
                value={sex}
                onChange={(value) => { setSex(value); setErrors((current) => ({ ...current, sex: "" })); }}
                error={errors.sex}
              />
              <AppInput
                label="Telefone"
                value={patientPhone}
                onChangeText={(value) => { setPatientPhone(maskPhone(value)); setErrors((current) => ({ ...current, patientPhone: "" })); }}
                keyboardType="phone-pad"
                inputMode="tel"
                maxLength={15}
                placeholder="(00) 00000-0000"
                error={errors.patientPhone}
              />
              <DateSelectField
                label="Data de nascimento"
                value={birthDate}
                onChange={(value) => { setBirthDate(value); setErrors((current) => ({ ...current, birthDate: "" })); }}
                maxYear={new Date().getFullYear()}
                maximumDate={new Date()}
                error={errors.birthDate}
              />
            </>
          ) : null}

          {role === "medico" ? (
            <View className="mb-2 mt-2 rounded-2xl bg-mint-50 p-4">
              <Text className="mb-4 font-black text-mint-800">Dados médicos</Text>
              <AppInput
                label="CRM"
                value={crm}
                onChangeText={(value) => {
                  setCrm(maskCRM(value));
                  setErrors((current) => ({ ...current, crm: "" }));
                }}
                keyboardType="numeric"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                error={errors.crm}
              />
            </View>
          ) : null}

          {role === "dono" ? (
            <View className="mb-2 mt-2 rounded-2xl bg-mint-50 p-4">
              <Text className="mb-4 font-black text-mint-800">Dados da unidade</Text>
              <AppInput
                label="CNPJ"
                value={cnpj}
                onChangeText={(value) => {
                  setCnpj(maskCNPJ(value));
                  setErrors((current) => ({ ...current, cnpj: "" }));
                }}
                keyboardType="numeric"
                inputMode="numeric"
                maxLength={18}
                placeholder="00.000.000/0000-00"
                error={errors.cnpj}
              />
              <AppInput
                label="Nome da unidade"
                value={unitName}
                onChangeText={(value) => {
                  setUnitName(value);
                  setErrors((current) => ({ ...current, unitName: "" }));
                }}
                placeholder="Clínica / hospital / consultório"
                error={errors.unitName}
              />
              <UnitLocationFields
                cep={cep}
                address={address}
                number={number}
                phone={phone}
                onCepChange={(value) => {
                  setCep(value);
                  setErrors((current) => ({ ...current, cep: "", address: "" }));
                }}
                onAddressChange={(value) => {
                  setAddress(value);
                  setErrors((current) => ({ ...current, address: "" }));
                }}
                onNumberChange={(value) => {
                  setNumber(onlyDigits(value).slice(0, 8));
                  setErrors((current) => ({ ...current, number: "" }));
                }}
                onPhoneChange={(value) => {
                  setPhone(value);
                  setErrors((current) => ({ ...current, phone: "" }));
                }}
                onLocationSelect={(item) => {
                  setCep(item.cep);
                  setAddress(item.formattedAddress);
                  setErrors((current) => ({ ...current, cep: "", address: "" }));
                }}
                cepError={errors.cep}
                addressError={errors.address}
                numberError={errors.number}
                phoneError={errors.phone}
              />

              <Text className="mb-2 font-semibold text-ink">Logo da unidade</Text>
              <Pressable
                onPress={pickLogo}
                className="mb-4 items-center rounded-2xl border border-dashed border-mint-300 bg-white p-4"
              >
                {logoUri ? <Image source={{ uri: logoUri }} className="mb-2 h-20 w-20 rounded-2xl" resizeMode="contain" /> : null}
                <Text className="font-bold text-mint-700">{logoUri ? "Trocar logo" : "Anexar logo"}</Text>
              </Pressable>
            </View>
          ) : null}

          <AppInput
            label="Senha"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              setErrors((current) => ({ ...current, password: "" }));
            }}
            secureTextEntry
            placeholder="Mínimo 6 caracteres"
            error={errors.password}
          />

          {errors.general ? (
            <View className="mb-4 rounded-2xl bg-red-50 p-3">
              <Text className="text-sm font-semibold text-red-600">{errors.general}</Text>
            </View>
          ) : null}

          <PrimaryButton title="Finalizar cadastro" onPress={submit} loading={loading} />
        </View>
      </View>
    </Screen>
  );
}
