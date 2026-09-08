import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Screen from "../../components/Screen";
import AppInput from "../../components/AppInput";
import CpfInput from "../../components/CpfInput";
import PrimaryButton from "../../components/PrimaryButton";
import { checkCpf } from "../../services/authService";
import { onlyDigits } from "../../utils/masks";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginScreen({ navigation }) {
  const { signIn, loading } = useAuth();
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ cpf: "", password: "", general: "" });

  function updateCpf(value) {
    setCpf(value);
    setErrors((current) => ({ ...current, cpf: "", general: "" }));
  }

  function updatePassword(value) {
    setPassword(value);
    setErrors((current) => ({ ...current, password: "", general: "" }));
  }

  async function handleLogin() {
    const cleanCpf = onlyDigits(cpf);
    const nextErrors = { cpf: "", password: "", general: "" };

    if (cleanCpf.length !== 11) {
      nextErrors.cpf = "CPF incompleto. Preencha os 11 números.";
    }

    if (!password) {
      nextErrors.password = "Informe sua senha.";
    }

    if (nextErrors.cpf || nextErrors.password) {
      setErrors(nextErrors);
      return;
    }

    try {
      const result = await checkCpf(cleanCpf);

      if (!result.exists) {
        navigation.navigate("Register", { cpf: cleanCpf });
        return;
      }

      await signIn(cleanCpf, password);
      setErrors({ cpf: "", password: "", general: "" });
    } catch (error) {
      setErrors({
        cpf: "",
        password: "Senha incorreta para este CPF. Digite novamente.",
        general: error.message,
      });
    }
  }

  return (
    <Screen>
      <View className="mx-auto w-full max-w-[520px]">
        <View className="mb-7 mt-8 items-center">
          <View
            className="mb-4 h-20 w-20 items-center justify-center rounded-3xl bg-mint-200"
            accessibilityLabel="Logo Saúde APP"
          >
            <Ionicons name="medical" size={42} color="#357257" />
          </View>
          <Text className="text-3xl font-black text-ink">Saúde APP</Text>
          <Text className="mt-2 text-center text-slate-500">
            Informação clínica simples, organizada e segura.
          </Text>
        </View>

        <View className="rounded-[28px] border border-mint-100 bg-white p-6 hover:shadow-xl transition-all duration-200">
          <Text className="text-2xl font-bold text-ink">Entrar</Text>
          <Text className="mb-6 mt-2 text-slate-500">
            Se o CPF ainda não existir, você será levado automaticamente ao cadastro.
          </Text>

          <CpfInput
            label="CPF"
            value={cpf}
            onChangeText={updateCpf}
            error={errors.cpf}
            showCheck={false}
          />

          <AppInput
            label="Senha"
            value={password}
            onChangeText={updatePassword}
            secureTextEntry
            placeholder="Digite sua senha"
            error={errors.password}
          />

          {errors.general ? (
            <View className="mb-4 rounded-2xl bg-red-50 p-3">
              <Text className="text-sm font-semibold text-red-600">{errors.general}</Text>
            </View>
          ) : null}

          <PrimaryButton title="Entrar" onPress={handleLogin} loading={loading} />

          <Pressable onPress={() => navigation.navigate("ForgotPassword")} className="mt-5 items-center">
            <Text className="font-semibold text-mint-700">Esqueceu a senha?</Text>
          </Pressable>

          <View className="mt-5 flex-row justify-center">
            <Text className="text-slate-500">Não tem uma conta? </Text>
            <Pressable onPress={() => navigation.navigate("Register")}>
              <Text className="font-bold text-mint-700">Crie uma</Text>
            </Pressable>
          </View>
        </View>

        <View className="mt-5 rounded-2xl bg-mint-50 p-4 hover:shadow-xl transition-all duration-200">
          <Text className="font-bold text-mint-800">Usuários mockados</Text>
          <Text className="mt-2 text-sm text-mint-800">Ana Martins (Paciente): 123.456.789-01 / 123456</Text>
          <Text className="text-sm text-mint-800">Dr. Rafael Lima (Médico): 987.654.321-00 / 123456</Text>
          <Text className="text-sm text-mint-800">Dra. Camila Nogueira (Médica): 333.444.555-66 / 123456
          </Text>
          <Text className="text-sm text-mint-800">Marcos Silva (Dono 1): 111.222.333-44 / 123456</Text>
          <Text className="text-sm text-mint-800">Fernanda Costa (Dono 2): 555.666.777-88 / 123456
          </Text>
          <Text className="text-sm text-mint-800">Lucas Almeida (Paciente): 222.333.444-55 / 123456</Text>
        </View>
      </View>
    </Screen>
  );
}
