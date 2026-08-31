import React from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";

export default function PrimaryButton({
  title,
  onPress,
  disabled,
  loading,
  variant = "primary",
  icon
}) {
  const primary = variant === "primary";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`flex-row items-center justify-center rounded-2xl px-5 py-4 ${
        primary ? "bg-mint-600" : "border border-mint-300 bg-mint-50"
      } ${(disabled || loading) ? "opacity-50" : ""}`}
    >
      {loading ? (
        <ActivityIndicator color={primary ? "#FFFFFF" : "#357257"} />
      ) : (
        <>
          {icon}
          <Text
            className={`font-bold ${icon ? "ml-2" : ""} ${
              primary ? "text-white" : "text-mint-700"
            }`}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}
