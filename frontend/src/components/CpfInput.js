import React from "react";
import { Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { maskCPF, onlyDigits } from "../utils/masks";

export default function CpfInput({
  label = "CPF",
  value,
  onChangeText,
  error,
  showCheck = true,
  disabled = false,
  ...props
}) {
  const cleanCpf = onlyDigits(value);
  const complete = cleanCpf.length === 11;

  function handleChange(text) {
    onChangeText(maskCPF(text));
  }

  return (
    <View className="mb-4">
      {label ? <Text className="mb-2 font-semibold text-ink">{label}</Text> : null}
      <View
        className={`flex-row items-center rounded-2xl border px-4 ${
          error ? "border-red-300 bg-red-50" : "border-mint-200 bg-white"
        } ${disabled ? "opacity-60" : ""}`}
      >
        <TextInput
          value={value}
          onChangeText={handleChange}
          keyboardType="numeric"
          inputMode="numeric"
          maxLength={14}
          editable={!disabled}
          placeholder="000.000.000-00"
          placeholderTextColor="#7D8D86"
          className="flex-1 py-4 text-base text-ink outline-none"
          {...props}
        />
        {showCheck && complete && !error ? (
          <View className="ml-2 h-6 w-6 items-center justify-center rounded-full bg-mint-100">
            <Ionicons name="checkmark" size={16} color="#357257" />
          </View>
        ) : null}
      </View>
      {error ? <Text className="mt-1 text-sm text-red-500">{error}</Text> : null}
    </View>
  );
}
