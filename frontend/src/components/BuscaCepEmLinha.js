import React, { useEffect, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { buscarCeps } from "../services/cepService";

const limitarDigitos = (valor = "") => String(valor).replace(/\D/g, "").slice(0, 8);
const mascararCep = (valor = "") => {
  const digitos = limitarDigitos(valor);
  return digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos;
};

export default function BuscaCepEmLinha({ valor, aoAlterar, aoSelecionar, erro, cepSelecionado }) {
  const [itens, definirItens] = useState([]);
  const [buscando, definirBuscando] = useState(false);
  const [aberto, definirAberto] = useState(false);
  const referenciaCepSelecionado = useRef("");
  const cepLimpo = limitarDigitos(valor);

  useEffect(() => {
    let ativo = true;

    if (!cepLimpo) {
      definirItens([]);
      definirAberto(false);
      referenciaCepSelecionado.current = "";
      return () => { ativo = false; };
    }

    if (cepLimpo === referenciaCepSelecionado.current || (cepSelecionado && cepLimpo === limitarDigitos(cepSelecionado))) {
      definirItens([]);
      definirAberto(false);
      return () => { ativo = false; };
    }

    const temporizador = setTimeout(async () => {
      definirBuscando(true);
      const resultados = await buscarCeps(cepLimpo);
      if (ativo) {
        definirItens(resultados || []);
        definirAberto(true);
        definirBuscando(false);
      }
    }, 180);

    return () => {
      ativo = false;
      clearTimeout(temporizador);
    };
  }, [cepLimpo, cepSelecionado]);

  function alterar(texto) {
    const proximoCep = mascararCep(texto);
    if (limitarDigitos(proximoCep) !== referenciaCepSelecionado.current) referenciaCepSelecionado.current = "";
    aoAlterar(proximoCep);
  }

  function selecionar(endereco) {
    referenciaCepSelecionado.current = limitarDigitos(endereco.cep);
    definirItens([]);
    definirAberto(false);
    definirBuscando(false);
    aoSelecionar(endereco);
  }

  return (
    <View className="mb-4">
      <Text className="mb-2 font-semibold text-ink">CEP</Text>
      <View className={`rounded-2xl border bg-white ${erro ? "border-red-400" : "border-mint-200"}`}>
        <View className="flex-row items-center px-4">
          <Ionicons name="location-outline" size={20} color="#3F8F68" />
          <TextInput value={mascararCep(valor)} onChangeText={alterar} keyboardType="numeric" inputMode="numeric" maxLength={9} placeholder="00000-000" placeholderTextColor="#7D8D86" className="flex-1 px-3 py-4 text-ink" />
          {buscando ? <Text className="text-xs text-slate-400">Buscando...</Text> : null}
        </View>

        {aberto && cepLimpo ? (
          <View className="border-t border-mint-100 px-2 pb-2 pt-2">
            {itens.length === 0 && !buscando ? (
              <Text className="px-3 py-3 text-center text-sm text-slate-500">Nenhum CEP localizado.</Text>
            ) : itens.map((endereco) => (
              <Pressable key={endereco.cep} onPress={() => selecionar(endereco)} className="rounded-xl px-3 py-3 active:bg-mint-50">
                <Text className="font-black text-mint-800">{endereco.cep}</Text>
                <Text className="mt-0.5 text-sm font-semibold text-ink">{endereco.logradouro}</Text>
                <Text className="mt-0.5 text-xs text-slate-500">{endereco.bairro} · {endereco.localidade}/{endereco.uf}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
      {erro ? <Text className="mt-1 text-xs font-semibold text-red-600">{erro}</Text> : null}
    </View>
  );
}
