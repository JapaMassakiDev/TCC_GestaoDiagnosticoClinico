import React, { useState } from "react";
import { Alert, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Screen from "../../components/Screen";
import AppInput from "../../components/AppInput";
import PrimaryButton from "../../components/PrimaryButton";
import { maskCPF, onlyDigits } from "../../utils/masks";
import { checkCpf } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginScreen({ navigation }) {
  const { signIn, loading } = useAuth();

  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");

  async function handleContinue() {
    const cleanCpf = onlyDigits(cpf);

    if (cleanCpf.length !== 11) {
      Alert.alert("CPF", "Digite os 11 números do CPF.");
      return;
    }

    try {
      const result = await checkCpf(cleanCpf);

      if (!result.exists) {
        navigation.navigate("Register", { cpf: cleanCpf });
        return;
      }

      if (!password) {
        Alert.alert("Senha", "Informe sua senha.");
        return;
      }

      await signIn(cleanCpf, password);
    } catch (error) {
      Alert.alert("Não foi possível entrar", error.message);
    }
  }

  return (
    <Screen>
      <View className="mb-8 mt-8 items-center">
        <View className="mb-5 h-20 w-20 items-center justify-center rounded-3xl bg-mint-200">
          <Ionicons name="medical" size={42} color="#357257" />
        </View>

        <Text className="text-3xl font-black text-ink">Saúde APP</Text>
        <Text className="mt-2 text-center text-base leading-6 text-slate-500">
          Seus diagnósticos em um só lugar.
        </Text>
      </View>

      <View className="rounded-[28px] border border-mint-100 bg-white p-5">
        <Text className="mb-1 text-2xl font-bold text-ink">Entrar</Text>
        <Text className="mb-6 text-slate-500">
          Primeiro verificamos se o CPF já está cadastrado.
        </Text>

        <AppInput
          label="CPF"
          value={cpf}
          onChangeText={(value) => setCpf(maskCPF(value))}
          keyboardType="numeric"
          placeholder="000.000.000-00"
          maxLength={14}
        />

        <AppInput
          label="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Digite sua senha"
        />

        <PrimaryButton
          title="Continuar"
          onPress={handleContinue}
          loading={loading}
        />
      </View>

      <View className="mt-5 rounded-2xl bg-mint-50 p-4">
        <Text className="font-bold text-mint-800">Contas para testar</Text>
        <Text className="mt-2 text-sm text-mint-800">
          Paciente: 123.456.789-01 / 123456
        </Text>
        <Text className="text-sm text-mint-800">
          Médico: 987.654.321-00 / 123456
        </Text>
        <Text className="text-sm text-mint-800">
          Dono: 111.222.333-44 / 123456
        </Text>
        <Text className="mt-2 text-xs text-mint-700">
          Para testar CPF novo, informe qualquer CPF diferente com 11 dígitos.
        </Text>
      </View>
    </Screen>
  );
}
