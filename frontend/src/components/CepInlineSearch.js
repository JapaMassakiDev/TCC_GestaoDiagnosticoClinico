import React, { useEffect, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { searchCeps } from "../services/cepService";

const onlyDigits = (value = "") => String(value).replace(/\D/g, "").slice(0, 8);
const maskCep = (value = "") => {
  const d = onlyDigits(value);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};

export default function CepInlineSearch({ value, onChange, onSelect, error, selectedCep }) {
  const [items, setItems] = useState([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const selectedCepRef = useRef("");
  const clean = onlyDigits(value);

  useEffect(() => {
    let active = true;

    if (!clean) {
      setItems([]);
      setOpen(false);
      selectedCepRef.current = "";
      return () => { active = false; };
    }

    if (clean === selectedCepRef.current || (selectedCep && clean === onlyDigits(selectedCep))) {
      setItems([]);
      setOpen(false);
      return () => { active = false; };
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      const rows = await searchCeps(clean);
      if (active) {
        setItems(rows || []);
        setOpen(true);
        setSearching(false);
      }
    }, 180);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [clean]);

  function handleChange(text) {
    const next = maskCep(text);
    if (onlyDigits(next) !== selectedCepRef.current) selectedCepRef.current = "";
    onChange(next);
  }

  function handleSelect(item) {
    selectedCepRef.current = onlyDigits(item.cep);
    setItems([]);
    setOpen(false);
    setSearching(false);
    onSelect(item);
  }

  return (
    <View className="mb-4">
      <Text className="mb-2 font-semibold text-ink">CEP</Text>
      <View className={`rounded-2xl border bg-white ${error ? "border-red-400" : "border-mint-200"}`}>
        <View className="flex-row items-center px-4">
          <Ionicons name="location-outline" size={20} color="#3F8F68" />
          <TextInput
            value={maskCep(value)}
            onChangeText={handleChange}
            keyboardType="numeric"
            inputMode="numeric"
            maxLength={9}
            placeholder="00000-000"
            placeholderTextColor="#7D8D86"
            className="flex-1 px-3 py-4 text-ink"
          />
          {searching ? <Text className="text-xs text-slate-400">Buscando...</Text> : null}
        </View>

        {open && clean ? (
          <View className="border-t border-mint-100 px-2 pb-2 pt-2">
            {items.length === 0 && !searching ? (
              <Text className="px-3 py-3 text-center text-sm text-slate-500">Nenhum CEP localizado.</Text>
            ) : items.map((item) => (
              <Pressable key={item.cep} onPress={() => handleSelect(item)} className="rounded-xl px-3 py-3 active:bg-mint-50">
                <Text className="font-black text-mint-800">{item.cep}</Text>
                <Text className="mt-0.5 text-sm font-semibold text-ink">{item.logradouro}</Text>
                <Text className="mt-0.5 text-xs text-slate-500">{item.bairro} · {item.localidade}/{item.uf}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
      {error ? <Text className="mt-1 text-xs font-semibold text-red-600">{error}</Text> : null}
    </View>
  );
}
