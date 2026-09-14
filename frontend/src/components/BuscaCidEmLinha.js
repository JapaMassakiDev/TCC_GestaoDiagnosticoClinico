import React, { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { buscarCids } from "../services/cidService";

export default function BuscaCidEmLinha({ valor, titulo, aoSelecionar, erro }) {
  const [busca, definirBusca] = useState("");
  const [aberto, definirAberto] = useState(false);
  const [itens, definirItens] = useState([]);

  useEffect(() => {
    let ativo = true;
    if (!aberto || !busca.trim()) {
      definirItens([]);
      return () => { ativo = false; };
    }
    const temporizador = setTimeout(() => {
      buscarCids(busca).then((linhas) => ativo && definirItens(linhas || []));
    }, 180);
    return () => { ativo = false; clearTimeout(temporizador); };
  }, [busca, aberto]);

  function escolher(cidEscolhido) {
    aoSelecionar(cidEscolhido);
    definirBusca("");
    definirItens([]);
    definirAberto(false);
  }

  return (
    <View className="mb-4">
      <Text className="mb-2 font-semibold text-ink">CID-11</Text>
      <View className={`rounded-2xl border bg-white ${erro ? "border-red-400" : "border-mint-200"}`}>
        <View className="flex-row items-center px-4">
          <Ionicons name="search-outline" size={20} color="#3F8F68" />
          <TextInput
            value={aberto ? busca : (valor ? `${valor}${titulo ? ` · ${titulo}` : ""}` : "")}
            onFocus={() => { definirAberto(true); if (valor) definirBusca(""); }}
            onChangeText={(texto) => { definirAberto(true); definirBusca(texto); }}
            placeholder="Buscar código ou diagnóstico..."
            placeholderTextColor="#7D8D86"
            className="flex-1 px-3 py-4 text-ink"
          />
          {valor ? (
            <Pressable onPress={() => { aoSelecionar({ code: "", title: "" }); definirBusca(""); definirAberto(true); }} accessibilityLabel="Limpar CID">
              <Ionicons name="close-circle" size={20} color="#94A3B8" />
            </Pressable>
          ) : null}
        </View>

        {aberto && busca.trim() ? (
          <View className="border-t border-mint-100 px-2 pb-2 pt-2">
            {itens.length === 0 ? (
              <Text className="px-3 py-4 text-center text-sm text-slate-500">Nenhum CID localizado.</Text>
            ) : itens.slice(0, 6).map((cidEncontrado) => (
              <Pressable key={cidEncontrado.id} onPress={() => escolher(cidEncontrado)} className="rounded-xl px-3 py-3 active:bg-mint-50">
                <Text className="font-black text-mint-800">{cidEncontrado.codigo ?? cidEncontrado.code}</Text>
                <Text className="mt-0.5 font-semibold text-ink">{cidEncontrado.titulo ?? cidEncontrado.title}</Text>
                {(cidEncontrado.descricao ?? cidEncontrado.description) ? <Text className="mt-0.5 text-xs text-slate-500">{cidEncontrado.descricao ?? cidEncontrado.description}</Text> : null}
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
      {erro ? <Text className="mt-1 text-xs font-semibold text-red-600">{erro}</Text> : null}
    </View>
  );
}
