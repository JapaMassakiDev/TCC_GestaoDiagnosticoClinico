import React from "react";
import { Text, TextInput, View } from "react-native";
export default function AppInput({ label, error, multiline, ...props }) {
  return <View className="mb-4">{label ? <Text className="mb-2 font-semibold text-ink">{label}</Text> : null}<TextInput placeholderTextColor="#7D8D86" multiline={multiline} textAlignVertical={multiline ? "top" : "center"} className={`rounded-2xl border px-4 text-base text-ink ${multiline ? "min-h-[110px] py-4" : "py-4"} ${error ? "border-red-300 bg-red-50" : "border-mint-200 bg-white"}`} {...props}/>{error ? <Text className="mt-1 text-sm text-red-500">{error}</Text> : null}</View>;
}
