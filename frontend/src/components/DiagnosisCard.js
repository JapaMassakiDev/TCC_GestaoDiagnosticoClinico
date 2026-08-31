import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function DiagnosisCard({ diagnosis, selected, onPress, selectable }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!selectable}
      className={`mb-3 rounded-3xl border p-4 ${
        selected ? "border-mint-600 bg-mint-100" : "border-mint-100 bg-white"
      }`}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-lg font-bold text-ink">{diagnosis.title}</Text>
          <Text className="mt-1 text-sm text-slate-500">
            {diagnosis.date} • {diagnosis.doctor}
          </Text>
        </View>

        {selectable ? (
          <Ionicons
            name={selected ? "checkmark-circle" : "ellipse-outline"}
            size={24}
            color={selected ? "#3F8F68" : "#A7B6B0"}
          />
        ) : null}
      </View>

      <Text className="mt-3 leading-5 text-slate-600">
        {diagnosis.description}
      </Text>

      <View className="mt-3 rounded-2xl bg-mint-50 p-3">
        <Text className="text-xs font-bold uppercase text-mint-700">
          Medicamentos
        </Text>
        <Text className="mt-1 text-sm text-slate-600">
          {diagnosis.medicines}
        </Text>
      </View>
    </Pressable>
  );
}
