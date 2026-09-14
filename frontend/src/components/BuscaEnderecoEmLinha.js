import React, { useEffect, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { buscarEnderecos } from "../services/cepService";

const normalizar = (valor = "") => String(valor).trim().toLocaleLowerCase("pt-BR");

export function formatarEnderecoCep(endereco) {
  return `${endereco.logradouro}, ${endereco.bairro} - ${endereco.localidade}/${endereco.uf}`;
}

export default function BuscaEnderecoEmLinha({ valor, aoAlterar, aoSelecionar, erro, enderecoSelecionado }) {
  const [itens, definirItens] = useState([]);
  const [buscando, definirBuscando] = useState(false);
  const [aberto, definirAberto] = useState(false);
  const referenciaEnderecoSelecionado = useRef("");
  const consulta = String(valor || "").trim();

  useEffect(() => {
    let ativo = true;
    const consultaNormalizada = normalizar(consulta);

    if (consultaNormalizada.length < 3) {
      definirItens([]);
      definirAberto(false);
      if (!consultaNormalizada) referenciaEnderecoSelecionado.current = "";
      return () => { ativo = false; };
    }

    const selecionadoExterno = normalizar(enderecoSelecionado);
    if (
      (referenciaEnderecoSelecionado.current && consultaNormalizada.startsWith(referenciaEnderecoSelecionado.current)) ||
      (selecionadoExterno && consultaNormalizada.startsWith(selecionadoExterno))
    ) {
      definirItens([]);
      definirAberto(false);
      return () => { ativo = false; };
    }

    const temporizador = setTimeout(async () => {
      definirBuscando(true);
      const resultados = await buscarEnderecos(consulta);
      if (ativo) {
        definirItens(resultados || []);
        definirAberto(true);
        definirBuscando(false);
      }
    }, 220);

    return () => {
      ativo = false;
      clearTimeout(temporizador);
    };
  }, [consulta, enderecoSelecionado]);

  function alterar(texto) {
    const textoNormalizado = normalizar(texto);
    if (!referenciaEnderecoSelecionado.current || !textoNormalizado.startsWith(referenciaEnderecoSelecionado.current)) {
      referenciaEnderecoSelecionado.current = "";
    }
    aoAlterar(texto);
  }

  function selecionar(endereco) {
    const enderecoFormatado = formatarEnderecoCep(endereco);
    referenciaEnderecoSelecionado.current = normalizar(enderecoFormatado);
    definirItens([]);
    definirAberto(false);
    definirBuscando(false);
    aoSelecionar(endereco, enderecoFormatado);
  }

  return (
    <View className="mb-4">
      <Text className="mb-2 font-semibold text-ink">Endereço</Text>
      <View className={`rounded-2xl border bg-white ${erro ? "border-red-400" : "border-mint-200"}`}>
        <View className="flex-row items-center px-4">
          <Ionicons name="map-outline" size={20} color="#3F8F68" />
          <TextInput value={valor} onChangeText={alterar} placeholder="Digite rua, bairro ou cidade" placeholderTextColor="#7D8D86" className="flex-1 px-3 py-4 text-ink" />
          {buscando ? <Text className="text-xs text-slate-400">Buscando...</Text> : null}
        </View>

        {aberto && consulta.length >= 3 ? (
          <View className="border-t border-mint-100 px-2 pb-2 pt-2">
            {itens.length === 0 && !buscando ? (
              <Text className="px-3 py-3 text-center text-sm text-slate-500">Nenhum endereço localizado.</Text>
            ) : itens.map((endereco) => (
              <Pressable key={endereco.cep} onPress={() => selecionar(endereco)} className="rounded-xl px-3 py-3 active:bg-mint-50">
                <Text className="font-black text-mint-800">{endereco.logradouro}</Text>
                <Text className="mt-0.5 text-sm font-semibold text-ink">{endereco.bairro} · {endereco.localidade}/{endereco.uf}</Text>
                <Text className="mt-0.5 text-xs text-slate-500">CEP {endereco.cep}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
      {erro ? <Text className="mt-1 text-xs font-semibold text-red-600">{erro}</Text> : null}
    </View>
  );
}
