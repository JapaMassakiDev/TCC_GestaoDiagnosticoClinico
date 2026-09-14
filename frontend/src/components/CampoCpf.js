import React from "react";
import { Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { mascararCpf, somenteDigitos } from "../utils/masks";

export default function CampoCpf({
  rotulo = "CPF",
  valor,
  aoAlterarTexto,
  erro,
  mostrarConfirmacao = true,
  aviso = false,
  desabilitado = false,
  ...propriedades
}) {
  const cpfLimpo = somenteDigitos(valor);
  const completo = cpfLimpo.length === 11;

  function alterarTexto(texto) {
    aoAlterarTexto(mascararCpf(texto));
  }

  return (
    <View className="mb-4">
      {rotulo ? <Text className="mb-2 font-semibold text-ink">{rotulo}</Text> : null}
      <View className={`flex-row items-center rounded-2xl border px-4 ${erro ? "border-red-300 bg-red-50" : "border-mint-200 bg-white"} ${desabilitado ? "opacity-60" : ""}`}>
        <TextInput
          value={valor}
          onChangeText={alterarTexto}
          keyboardType="numeric"
          inputMode="numeric"
          maxLength={14}
          editable={!desabilitado}
          placeholder="000.000.000-00"
          placeholderTextColor="#7D8D86"
          className="flex-1 py-4 text-base text-ink outline-none"
          {...propriedades}
        />
        {(aviso || (mostrarConfirmacao && completo && !erro)) ? (
          <View className={`ml-2 h-6 w-6 items-center justify-center rounded-full ${aviso ? "bg-amber-100" : "bg-mint-100"}`}>
            <Ionicons name={aviso ? "warning" : "checkmark"} size={16} color={aviso ? "#B45309" : "#357257"} />
          </View>
        ) : null}
      </View>
      {erro ? <Text className="mt-1 text-sm text-red-500">{erro}</Text> : null}
    </View>
  );
}
