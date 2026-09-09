import React, { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";

export default function ScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return <View className="flex-1 bg-black" />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-cream px-6">
        <Ionicons name="camera-outline" size={50} color="#3F8F68" />
        <Text className="mt-5 text-center text-2xl font-bold text-ink">
          Permissão de câmera
        </Text>
        <Text className="mt-2 text-center leading-6 text-slate-500">
          A câmera é necessária para ler o QR Code gerado pelo paciente.
        </Text>

        <Pressable
          onPress={requestPermission}
          className="mt-6 rounded-2xl bg-mint-600 px-6 py-4"
        >
          <Text className="font-bold text-white">Permitir câmera</Text>
        </Pressable>
      </View>
    );
  }

  function handleBarcodeScanned({ data }) {
    if (scanned) return;

    setScanned(true);

    try {
      const parsed = JSON.parse(data);

      if (parsed.type !== "MEDGREEN_DIAGNOSIS_SHARE" || !Array.isArray(parsed.diagnoses)) {
        throw new Error();
      }

      Alert.alert(
        "Diagnósticos recebidos",
        `${parsed.diagnoses.length} diagnóstico(s) foram recebidos com sucesso.`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch {
      Alert.alert(
        "QR Code inválido",
        "Este QR Code não pertence ao compartilhamento do MedGreen.",
        [{ text: "Tentar novamente", onPress: () => setScanned(false) }]
      );
    }
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      <View className="absolute left-0 right-0 top-14 flex-row items-center px-5">
        <Pressable
          onPress={() => navigation.goBack()}
          className="h-12 w-12 items-center justify-center rounded-full bg-black/50"
        >
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </Pressable>
        <Text className="ml-4 text-xl font-bold text-white">Escanear QR Code</Text>
      </View>

      <View className="absolute bottom-12 left-6 right-6 rounded-3xl bg-white/95 p-5">
        <Text className="text-center font-semibold text-ink">
          Centralize o QR Code do paciente na câmera.
        </Text>
      </View>
    </View>
  );
}
