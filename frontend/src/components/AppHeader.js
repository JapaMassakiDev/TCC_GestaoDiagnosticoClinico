import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
export default function AppHeader({ title, subtitle, onBack }) {
  return <View className="mb-6 mt-2">{onBack ? <Pressable onPress={onBack} className="mb-4 h-10 w-10 items-center justify-center rounded-full bg-mint-100"><Ionicons name="arrow-back" size={22} color="#357257"/></Pressable> : null}<Text className="text-3xl font-black text-ink">{title}</Text>{subtitle ? <Text className="mt-2 leading-6 text-slate-500">{subtitle}</Text> : null}</View>;
}
