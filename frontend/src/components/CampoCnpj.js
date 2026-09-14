import React from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { mascararCnpj } from "../utils/masks";

export default function CampoCnpj({
  rotulo = "CNPJ",
  valor,
  aoAlterarTexto,
  erro,
  status = "idle",
  desabilitado = false,
  ...propriedades
}) {
  return (
    <View className="mb-4">
      {rotulo ? <Text className="mb-2 font-semibold text-ink">{rotulo}</Text> : null}
      <View className={`flex-row items-center rounded-2xl border px-4 ${erro ? "border-red-300 bg-red-50" : "border-mint-200 bg-white"} ${desabilitado ? "opacity-60" : ""}`}>
        <TextInput
          value={valor}
          onChangeText={(texto) => aoAlterarTexto(mascararCnpj(texto))}
          keyboardType="numeric"
          inputMode="numeric"
          maxLength={18}
          editable={!desabilitado}
          placeholder="00.000.000/0000-00"
          placeholderTextColor="#7D8D86"
          className="flex-1 py-4 text-base text-ink outline-none"
          {...propriedades}
        />
        {status === "checking" ? <ActivityIndicator size="small" color="#357257" /> : null}
        {status === "valid" ? (
          <View className="ml-2 h-6 w-6 items-center justify-center rounded-full bg-mint-100">
            <Ionicons name="checkmark" size={16} color="#357257" />
          </View>
        ) : null}
      </View>
      {status === "checking" ? <Text className="mt-1 text-xs text-slate-400">Validando CNPJ...</Text> : null}
      {status === "valid" && !erro ? <Text className="mt-1 text-xs font-semibold text-mint-700">CNPJ válido.</Text> : null}
      {erro ? <Text className="mt-1 text-sm text-red-500">{erro}</Text> : null}
    </View>
  );
}
