import React from "react";
import { Pressable, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Ionicons } from "@expo/vector-icons";

import Screen from "../../components/Screen";

export default function ShareQrScreen({ navigation, route }) {
  const diagnoses = route.params?.diagnoses || [];

  const payload = JSON.stringify({
    type: "MEDGREEN_DIAGNOSIS_SHARE",
    version: 1,
    createdAt: new Date().toISOString(),
    diagnoses
  });

  return (
    <Screen>
      <Pressable onPress={() => navigation.goBack()} className="mt-2 self-start p-2">
        <Ionicons name="arrow-back" size={26} color="#26352F" />
      </Pressable>

      <Text className="mt-2 text-center text-3xl font-black text-ink">
        Compartilhar diagnósticos
      </Text>
      <Text className="mx-3 mt-2 text-center leading-6 text-slate-500">
        Mostre este QR Code ao médico. No projeto real, o ideal é usar um token temporário
        em vez de carregar dados clínicos diretamente no QR.
      </Text>

      <View className="my-8 items-center rounded-[32px] border border-mint-100 bg-white p-8">
        <QRCode value={payload} size={230} color="#26352F" backgroundColor="#FFFFFF" />
      </View>

      <View className="rounded-2xl bg-mint-50 p-4">
        <Text className="font-bold text-mint-800">Conteúdo selecionado</Text>
        {diagnoses.map((item) => (
          <Text key={item.id} className="mt-2 text-mint-800">
            • {item.title}
          </Text>
        ))}
      </View>
    </Screen>
  );
}
