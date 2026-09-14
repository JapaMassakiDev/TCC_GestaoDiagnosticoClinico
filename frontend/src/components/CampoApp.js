import React from "react";
import { Text, TextInput, View } from "react-native";

export default function CampoApp({ rotulo, erro, multilinha, valor, aoAlterarTexto, ...propriedades }) {
  return (
    <View className="mb-4">
      {rotulo ? <Text className="mb-2 font-semibold text-ink">{rotulo}</Text> : null}
      <TextInput
        value={valor}
        onChangeText={aoAlterarTexto}
        placeholderTextColor="#7D8D86"
        multiline={multilinha}
        textAlignVertical={multilinha ? "top" : "center"}
        className={`rounded-2xl border px-4 text-base text-ink ${multilinha ? "min-h-[110px] py-4" : "py-4"} ${erro ? "border-red-300 bg-red-50" : "border-mint-200 bg-white"}`}
        {...propriedades}
      />
      {erro ? <Text className="mt-1 text-sm text-red-500">{erro}</Text> : null}
    </View>
  );
}
