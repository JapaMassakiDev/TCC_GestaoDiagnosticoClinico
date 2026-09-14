import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Tela({ filhos, children, rolavel = true, classe = "", classeConteudo = "" }) {
  const conteudo = filhos ?? children;

  if (!rolavel) {
    return (
      <SafeAreaView className={`flex-1 bg-cream ${classe}`}>
        <View className={`flex-1 px-5 ${classeConteudo}`}>{conteudo}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 bg-cream ${classe}`}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
        className={classeConteudo}
      >
        {conteudo}
      </ScrollView>
    </SafeAreaView>
  );
}
