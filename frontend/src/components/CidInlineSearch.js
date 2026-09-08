import React, { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { searchCids } from "../services/cidService";

export default function CidInlineSearch({ value, title, onSelect, error }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    let active = true;
    if (!open || !query.trim()) {
      setItems([]);
      return () => { active = false; };
    }
    const timer = setTimeout(() => {
      searchCids(query).then((rows) => active && setItems(rows || []));
    }, 180);
    return () => { active = false; clearTimeout(timer); };
  }, [query, open]);

  function choose(item) {
    onSelect(item);
    setQuery("");
    setItems([]);
    setOpen(false);
  }

  return (
    <View className="mb-4">
      <Text className="mb-2 font-semibold text-ink">CID-11</Text>
      <View className={`rounded-2xl border bg-white ${error ? "border-red-400" : "border-mint-200"}`}>
        <View className="flex-row items-center px-4">
          <Ionicons name="search-outline" size={20} color="#3F8F68" />
          <TextInput
            value={open ? query : (value ? `${value}${title ? ` · ${title}` : ""}` : "")}
            onFocus={() => { setOpen(true); if (value) setQuery(""); }}
            onChangeText={(text) => { setOpen(true); setQuery(text); }}
            placeholder="Buscar código ou diagnóstico..."
            placeholderTextColor="#7D8D86"
            className="flex-1 px-3 py-4 text-ink"
          />
          {value ? (
            <Pressable onPress={() => { onSelect({ code: "", title: "" }); setQuery(""); setOpen(true); }} accessibilityLabel="Limpar CID">
              <Ionicons name="close-circle" size={20} color="#94A3B8" />
            </Pressable>
          ) : null}
        </View>

        {open && query.trim() ? (
          <View className="border-t border-mint-100 px-2 pb-2 pt-2">
            {items.length === 0 ? (
              <Text className="px-3 py-4 text-center text-sm text-slate-500">Nenhum CID localizado.</Text>
            ) : items.slice(0, 6).map((item) => (
              <Pressable key={item.id} onPress={() => choose(item)} className="rounded-xl px-3 py-3 active:bg-mint-50">
                <Text className="font-black text-mint-800">{item.code}</Text>
                <Text className="mt-0.5 font-semibold text-ink">{item.title}</Text>
                {item.description ? <Text className="mt-0.5 text-xs text-slate-500">{item.description}</Text> : null}
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
      {error ? <Text className="mt-1 text-xs font-semibold text-red-600">{error}</Text> : null}
    </View>
  );
}
