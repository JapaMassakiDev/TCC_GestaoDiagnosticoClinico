import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

function OpcaoBasica({ ativa, rotulo, icone, aoPressionar }) {
  return (
    <Pressable onPress={aoPressionar} className={`min-w-[115px] flex-1 flex-row items-center justify-center gap-2 rounded-2xl border px-3 py-3 ${ativa ? "border-mint-500 bg-mint-100" : "border-mint-200 bg-white"}`}>
      <Ionicons name={icone} size={18} color={ativa ? "#357257" : "#64748B"} />
      <Text className={`text-sm font-bold ${ativa ? "text-mint-800" : "text-slate-600"}`}>{rotulo}</Text>
      {ativa ? <Ionicons name="checkmark-circle" size={17} color="#3F8F68" /> : null}
    </Pressable>
  );
}

export default function SeletorSexo({ valor = "", aoAlterar, erro }) {
  const outroSelecionado = valor === "Outro" || valor.startsWith("Outro: ");
  const textoOutro = valor.startsWith("Outro: ") ? valor.slice(7) : "";

  return (
    <View className="mb-4">
      <Text className="mb-2 font-semibold text-ink">Sexo</Text>
      <View className="flex-row flex-wrap gap-2">
        <OpcaoBasica ativa={valor === "Masculino"} rotulo="Masculino" icone="male-outline" aoPressionar={() => aoAlterar("Masculino")} />
        <OpcaoBasica ativa={valor === "Feminino"} rotulo="Feminino" icone="female-outline" aoPressionar={() => aoAlterar("Feminino")} />
        <Pressable onPress={() => aoAlterar(outroSelecionado ? valor : "Outro")} className={`min-w-[150px] flex-1 rounded-2xl border px-3 py-3 ${outroSelecionado ? "border-mint-500 bg-mint-100" : "border-mint-200 bg-white"}`}>
          <View className="flex-row items-center justify-center gap-2">
            <Ionicons name="person-outline" size={18} color={outroSelecionado ? "#357257" : "#64748B"} />
            <Text className={`text-sm font-bold ${outroSelecionado ? "text-mint-800" : "text-slate-600"}`}>Outro</Text>
            {outroSelecionado ? <Ionicons name="checkmark-circle" size={17} color="#3F8F68" /> : null}
          </View>
          {outroSelecionado ? (
            <TextInput
              value={textoOutro}
              onChangeText={(texto) => aoAlterar(texto.trimStart() ? `Outro: ${texto}` : "Outro")}
              onPressIn={(evento) => evento.stopPropagation?.()}
              placeholder="Como você se identifica?"
              placeholderTextColor="#7D8D86"
              className="mt-3 rounded-xl border border-mint-200 bg-white px-3 py-2 text-sm text-ink"
              autoCapitalize="sentences"
            />
          ) : null}
        </Pressable>
      </View>
      {erro ? <Text className="mt-1 text-sm text-red-500">{erro}</Text> : null}
    </View>
  );
}
