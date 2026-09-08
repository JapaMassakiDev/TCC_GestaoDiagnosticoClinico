import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

function BasicOption({ active, label, icon, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className={`min-w-[115px] flex-1 flex-row items-center justify-center gap-2 rounded-2xl border px-3 py-3 ${active ? "border-mint-500 bg-mint-100" : "border-mint-200 bg-white"}`}
    >
      <Ionicons name={icon} size={18} color={active ? "#357257" : "#64748B"} />
      <Text className={`text-sm font-bold ${active ? "text-mint-800" : "text-slate-600"}`}>{label}</Text>
      {active ? <Ionicons name="checkmark-circle" size={17} color="#3F8F68" /> : null}
    </Pressable>
  );
}

export default function SexSelector({ value = "", onChange, error }) {
  const isOther = value === "Outro" || value.startsWith("Outro: ");
  const otherText = value.startsWith("Outro: ") ? value.slice(7) : "";

  return (
    <View className="mb-4">
      <Text className="mb-2 font-semibold text-ink">Sexo</Text>
      <View className="flex-row flex-wrap gap-2">
        <BasicOption active={value === "Masculino"} label="Masculino" icon="male-outline" onPress={() => onChange("Masculino")} />
        <BasicOption active={value === "Feminino"} label="Feminino" icon="female-outline" onPress={() => onChange("Feminino")} />
        <Pressable
          onPress={() => onChange(isOther ? value : "Outro")}
          className={`min-w-[150px] flex-1 rounded-2xl border px-3 py-3 ${isOther ? "border-mint-500 bg-mint-100" : "border-mint-200 bg-white"}`}
        >
          <View className="flex-row items-center justify-center gap-2">
            <Ionicons name="person-outline" size={18} color={isOther ? "#357257" : "#64748B"} />
            <Text className={`text-sm font-bold ${isOther ? "text-mint-800" : "text-slate-600"}`}>Outro</Text>
            {isOther ? <Ionicons name="checkmark-circle" size={17} color="#3F8F68" /> : null}
          </View>
          {isOther ? (
            <TextInput
              value={otherText}
              onChangeText={(text) => onChange(text.trimStart() ? `Outro: ${text}` : "Outro")}
              onPressIn={(event) => event.stopPropagation?.()}
              placeholder="Como você se identifica?"
              placeholderTextColor="#7D8D86"
              className="mt-3 rounded-xl border border-mint-200 bg-white px-3 py-2 text-sm text-ink"
              autoCapitalize="sentences"
            />
          ) : null}
        </Pressable>
      </View>
      {error ? <Text className="mt-1 text-sm text-red-500">{error}</Text> : null}
    </View>
  );
}
