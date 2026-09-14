import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const variantes = {
  primary: { caixa: "bg-mint-600", texto: "text-white", indicador: "#FFFFFF", icone: "#FFFFFF" },
  secondary: { caixa: "border border-mint-300 bg-mint-50", texto: "text-mint-800", indicador: "#357257", icone: "#357257" },
  print: { caixa: "bg-blue-600", texto: "text-white", indicador: "#FFFFFF", icone: "#FFFFFF" },
  pdf: { caixa: "bg-red-600", texto: "text-white", indicador: "#FFFFFF", icone: "#FFFFFF" },
};

export default function BotaoPrimario({ titulo, aoPressionar, desabilitado, carregando, variante = "primary", icone }) {
  const atual = variantes[variante] || variantes.primary;
  return (
    <Pressable
      onPress={aoPressionar}
      disabled={desabilitado || carregando}
      className={`items-center justify-center rounded-2xl px-5 py-4 ${atual.caixa} ${(desabilitado || carregando) ? "opacity-50" : ""}`}
    >
      {carregando ? <ActivityIndicator color={atual.indicador} /> : (
        <View className="flex-row items-center justify-center gap-2">
          {icone ? <Ionicons name={icone} size={19} color={atual.icone} /> : null}
          <Text className={`font-bold ${atual.texto}`}>{titulo}</Text>
        </View>
      )}
    </Pressable>
  );
}
