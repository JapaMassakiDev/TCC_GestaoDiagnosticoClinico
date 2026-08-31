import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Screen from "../../components/Screen";
import PrimaryButton from "../../components/PrimaryButton";
import { useAuth } from "../../contexts/AuthContext";
import { maskCPF } from "../../utils/masks";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  return (
    <Screen>
      <View className="mt-8 items-center">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-mint-200">
          <Ionicons name="person" size={46} color="#357257" />
        </View>

        <Text className="mt-5 text-2xl font-black text-ink">{user.name}</Text>
        <Text className="mt-1 capitalize text-mint-700">{user.role}</Text>
      </View>

      <View className="my-7 rounded-3xl border border-mint-100 bg-white p-5">
        <Text className="text-sm font-bold uppercase text-slate-400">E-mail</Text>
        <Text className="mt-1 text-base text-ink">{user.email}</Text>

        <Text className="mt-5 text-sm font-bold uppercase text-slate-400">CPF</Text>
        <Text className="mt-1 text-base text-ink">{maskCPF(user.cpf)}</Text>

        {user.crm ? (
          <>
            <Text className="mt-5 text-sm font-bold uppercase text-slate-400">CRM</Text>
            <Text className="mt-1 text-base text-ink">{user.crm}</Text>
          </>
        ) : null}

        {user.cnpj ? (
          <>
            <Text className="mt-5 text-sm font-bold uppercase text-slate-400">CNPJ</Text>
            <Text className="mt-1 text-base text-ink">{user.cnpj}</Text>
          </>
        ) : null}
      </View>

      <PrimaryButton title="Sair" onPress={signOut} variant="secondary" />
    </Screen>
  );
}
