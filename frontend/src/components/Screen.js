import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function Screen({ children, scroll = true, className = "", contentClassName = "" }) {
  if (!scroll) return <SafeAreaView className={`flex-1 bg-cream ${className}`}><View className={`flex-1 px-5 ${contentClassName}`}>{children}</View></SafeAreaView>;
  return <SafeAreaView className={`flex-1 bg-cream ${className}`}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingBottom: 48 }} className={contentClassName}>{children}</ScrollView></SafeAreaView>;
}
