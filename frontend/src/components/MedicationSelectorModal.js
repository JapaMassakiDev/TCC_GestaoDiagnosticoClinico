import React, { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { searchMedications } from "../services/catalogService";

export default function MedicationSelectorModal({ visible, onClose, onSelect }) {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    let active = true;
    if (!visible) return undefined;
    searchMedications(search).then((data) => active && setItems(data || []));
    return () => { active = false; };
  }, [visible, search]);

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/40 p-5">
        <View className="max-h-[80%] w-full max-w-[650px] rounded-3xl bg-white p-5 hover:shadow-xl transition-all duration-200">
          <View className="mb-4 flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="text-xl font-black text-ink">Selecionar medicamento</Text>
              <Text className="mt-1 text-sm text-slate-500">Mock SNGPC isolado, preparado para futura integração com a ANVISA.</Text>
            </View>
            <Pressable onPress={onClose}><Text className="text-xl font-bold text-slate-500">✕</Text></Pressable>
          </View>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por nome ou princípio ativo..."
            placeholderTextColor="#7D8D86"
            className="mb-4 rounded-2xl border border-mint-200 bg-mint-50 px-4 py-4 text-ink hover:shadow-xl transition-all duration-200"
          />
          <ScrollView>
            {items.length === 0 ? <Text className="py-8 text-center text-slate-500">Nenhum medicamento localizado.</Text> : null}
            {items.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => { onSelect(item); onClose(); }}
                className="mb-3 flex-row items-center justify-between rounded-2xl border border-mint-100 p-4"
              >
                <View className="mr-3 flex-1">
                  <Text className="font-black text-ink">{item.name}</Text>
                  <Text className="mt-1 text-xs text-slate-500">Princípio: {item.activeIngredient} · Via: {item.administrationRoute}</Text>
                </View>
                <Text className="font-bold text-mint-700">+ Selecionar</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
