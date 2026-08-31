import React, { useMemo, useState } from "react";
import { Alert, Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";

import Screen from "../../components/Screen";
import AppInput from "../../components/AppInput";
import PrimaryButton from "../../components/PrimaryButton";
import { maskCNPJ, maskCPF, maskCRM, onlyDigits } from "../../utils/masks";
import { useAuth } from "../../contexts/AuthContext";

export default function RegisterScreen({ route }) {
  const { signUp, loading } = useAuth();

  const [role, setRole] = useState("paciente");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState(maskCPF(route.params?.cpf || ""));
  const [crm, setCrm] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [password, setPassword] = useState("");

  const roleLabel = useMemo(() => {
    return {
      paciente: "Paciente",
      medico: "Médico",
      dono: "Dono da unidade"
    }[role];
  }, [role]);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || onlyDigits(cpf).length !== 11 || !password) {
      Alert.alert("Cadastro", "Preencha nome, e-mail, CPF e senha.");
      return;
    }

    if (role === "medico" && onlyDigits(crm).length < 4) {
      Alert.alert("CRM", "Informe um CRM válido para o mock.");
      return;
    }

    if (role === "dono" && onlyDigits(cnpj).length !== 14) {
      Alert.alert("CNPJ", "Informe os 14 números do CNPJ.");
      return;
    }

    try {
      await signUp({
        role,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        cpf,
        crm: role === "medico" ? crm : undefined,
        cnpj: role === "dono" ? cnpj : undefined,
        password
      });
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  }

  return (
    <Screen>
      <Text className="mt-3 text-3xl font-black text-ink">Criar conta</Text>
      <Text className="mb-6 mt-2 leading-6 text-slate-500">
        O CPF não foi encontrado. Complete o cadastro abaixo.
      </Text>

      <Text className="mb-2 font-semibold text-ink">Perfil</Text>
      <View className="mb-4 overflow-hidden rounded-2xl border border-mint-200 bg-white">
        <Picker selectedValue={role} onValueChange={setRole}>
          <Picker.Item label="Paciente" value="paciente" />
          <Picker.Item label="Médico" value="medico" />
          <Picker.Item label="Dono da unidade" value="dono" />
        </Picker>
      </View>

      <View className="mb-5 rounded-2xl bg-mint-50 p-4">
        <Text className="font-bold text-mint-800">
          Cadastro como {roleLabel}
        </Text>
        <Text className="mt-1 text-sm leading-5 text-mint-700">
          Todos informam nome completo, e-mail e CPF. Médico também informa CRM.
          Dono também informa CNPJ.
        </Text>
      </View>

      <AppInput label="Nome completo" value={name} onChangeText={setName} placeholder="Seu nome completo" />
      <AppInput label="E-mail" value={email} onChangeText={setEmail} placeholder="voce@email.com" keyboardType="email-address" autoCapitalize="none" />
      <AppInput label="CPF" value={cpf} onChangeText={(v) => setCpf(maskCPF(v))} keyboardType="numeric" maxLength={14} placeholder="000.000.000-00" />

      {role === "medico" && (
        <AppInput
          label="CRM"
          value={crm}
          onChangeText={(v) => setCrm(maskCRM(v))}
          keyboardType="numeric"
          placeholder="CRM 000000"
          maxLength={10}
        />
      )}

      {role === "dono" && (
        <AppInput
          label="CNPJ"
          value={cnpj}
          onChangeText={(v) => setCnpj(maskCNPJ(v))}
          keyboardType="numeric"
          placeholder="00.000.000/0000-00"
          maxLength={18}
        />
      )}

      <AppInput
        label="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Crie uma senha"
      />

      <PrimaryButton title="Finalizar cadastro" onPress={handleRegister} loading={loading} />
    </Screen>
  );
}
