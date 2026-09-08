import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const variants = {
  primary: { box: "bg-mint-600", text: "text-white", spinner: "#FFFFFF", icon: "#FFFFFF" },
  secondary: { box: "border border-mint-300 bg-mint-50", text: "text-mint-800", spinner: "#357257", icon: "#357257" },
  print: { box: "bg-blue-600", text: "text-white", spinner: "#FFFFFF", icon: "#FFFFFF" },
  pdf: { box: "bg-red-600", text: "text-white", spinner: "#FFFFFF", icon: "#FFFFFF" },
};

export default function PrimaryButton({ title, onPress, disabled, loading, variant = "primary", icon }) {
  const current = variants[variant] || variants.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`items-center justify-center rounded-2xl px-5 py-4 ${current.box} ${(disabled || loading) ? "opacity-50" : ""}`}
    >
      {loading ? <ActivityIndicator color={current.spinner} /> : (
        <View className="flex-row items-center justify-center gap-2">
          {icon ? <Ionicons name={icon} size={19} color={current.icon} /> : null}
          <Text className={`font-bold ${current.text}`}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}
