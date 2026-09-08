import React, { useEffect, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { searchAddresses } from "../services/cepService";

const normalize = (value = "") => String(value).trim().toLocaleLowerCase("pt-BR");

export function formatCepAddress(item) {
  return `${item.logradouro}, ${item.bairro} - ${item.localidade}/${item.uf}`;
}

export default function AddressInlineSearch({ value, onChange, onSelect, error, selectedAddress }) {
  const [items, setItems] = useState([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const selectedAddressRef = useRef("");
  const query = String(value || "").trim();

  useEffect(() => {
    let active = true;
    const normalized = normalize(query);

    if (normalized.length < 3) {
      setItems([]);
      setOpen(false);
      if (!normalized) selectedAddressRef.current = "";
      return () => { active = false; };
    }

    // Depois de selecionar um endereço, permite complementar número/complemento
    // sem reabrir imediatamente a mesma lista de sugestões.
    const externalSelected = normalize(selectedAddress);
    if (
      (selectedAddressRef.current && normalized.startsWith(selectedAddressRef.current)) ||
      (externalSelected && normalized.startsWith(externalSelected))
    ) {
      setItems([]);
      setOpen(false);
      return () => { active = false; };
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      const rows = await searchAddresses(query);
      if (active) {
        setItems(rows || []);
        setOpen(true);
        setSearching(false);
      }
    }, 220);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  function handleChange(text) {
    const normalized = normalize(text);
    if (!selectedAddressRef.current || !normalized.startsWith(selectedAddressRef.current)) {
      selectedAddressRef.current = "";
    }
    onChange(text);
  }

  function handleSelect(item) {
    const formatted = formatCepAddress(item);
    selectedAddressRef.current = normalize(formatted);
    setItems([]);
    setOpen(false);
    setSearching(false);
    onSelect(item, formatted);
  }

  return (
    <View className="mb-4">
      <Text className="mb-2 font-semibold text-ink">Endereço</Text>
      <View className={`rounded-2xl border bg-white ${error ? "border-red-400" : "border-mint-200"}`}>
        <View className="flex-row items-center px-4">
          <Ionicons name="map-outline" size={20} color="#3F8F68" />
          <TextInput
            value={value}
            onChangeText={handleChange}
            placeholder="Digite rua, bairro ou cidade"
            placeholderTextColor="#7D8D86"
            className="flex-1 px-3 py-4 text-ink"
          />
          {searching ? <Text className="text-xs text-slate-400">Buscando...</Text> : null}
        </View>

        {open && query.length >= 3 ? (
          <View className="border-t border-mint-100 px-2 pb-2 pt-2">
            {items.length === 0 && !searching ? (
              <Text className="px-3 py-3 text-center text-sm text-slate-500">Nenhum endereço localizado.</Text>
            ) : items.map((item) => (
              <Pressable key={item.cep} onPress={() => handleSelect(item)} className="rounded-xl px-3 py-3 active:bg-mint-50">
                <Text className="font-black text-mint-800">{item.logradouro}</Text>
                <Text className="mt-0.5 text-sm font-semibold text-ink">{item.bairro} · {item.localidade}/{item.uf}</Text>
                <Text className="mt-0.5 text-xs text-slate-500">CEP {item.cep}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
      {error ? <Text className="mt-1 text-xs font-semibold text-red-600">{error}</Text> : null}
    </View>
  );
}
