import React, { useState } from "react";
import { useWindowDimensions, View } from "react-native";
import CampoApp from "./CampoApp";
import BuscaCepEmLinha from "./BuscaCepEmLinha";
import BuscaEnderecoEmLinha, { formatarEnderecoCep } from "./BuscaEnderecoEmLinha";
import { mascararTelefone, somenteDigitos } from "../utils/masks";

export default function CamposLocalizacaoUnidade({
  cep,
  endereco,
  numero,
  telefone,
  aoAlterarCep,
  aoAlterarEndereco,
  aoAlterarNumero,
  aoAlterarTelefone,
  aoSelecionarLocalizacao,
  erroCep,
  erroEndereco,
  erroNumero,
  erroTelefone,
}) {
  const { width: largura } = useWindowDimensions();
  const telaLarga = largura >= 768;
  const [localizacaoSelecionada, definirLocalizacaoSelecionada] = useState(() => (
    cep || endereco ? { cep, enderecoFormatado: endereco } : null
  ));

  function selecionarLocalizacao(localizacao, enderecoFormatado = formatarEnderecoCep(localizacao)) {
    const selecionada = { ...localizacao, enderecoFormatado, formattedAddress: enderecoFormatado };
    definirLocalizacaoSelecionada(selecionada);
    aoSelecionarLocalizacao(selecionada);
  }

  return (
    <>
      <View style={telaLarga ? { flexDirection: "row", gap: 12, alignItems: "flex-start" } : undefined}>
        <View style={telaLarga ? { flex: 1 } : undefined}>
          <BuscaCepEmLinha
            valor={cep}
            aoAlterar={aoAlterarCep}
            aoSelecionar={(localizacao) => selecionarLocalizacao(localizacao)}
            erro={erroCep}
            cepSelecionado={localizacaoSelecionada?.cep}
          />
        </View>

        <View style={telaLarga ? { flex: 1 } : undefined}>
          <CampoApp
            rotulo="Telefone da unidade"
            valor={mascararTelefone(telefone)}
            aoAlterarTexto={(valor) => aoAlterarTelefone(somenteDigitos(valor).slice(0, 11))}
            keyboardType="phone-pad"
            inputMode="tel"
            maxLength={15}
            placeholder="(00) 00000-0000"
            erro={erroTelefone}
          />
        </View>
      </View>

      <View style={telaLarga ? { flexDirection: "row", gap: 12, alignItems: "flex-start" } : undefined}>
        <View style={telaLarga ? { flex: 3 } : undefined}>
          <BuscaEnderecoEmLinha
            valor={endereco}
            aoAlterar={aoAlterarEndereco}
            aoSelecionar={(localizacao, enderecoFormatado) => selecionarLocalizacao(localizacao, enderecoFormatado)}
            erro={erroEndereco}
            enderecoSelecionado={localizacaoSelecionada?.enderecoFormatado ?? localizacaoSelecionada?.formattedAddress}
          />
        </View>

        <View style={telaLarga ? { flex: 1 } : undefined}>
          <CampoApp
            rotulo="Número"
            valor={numero}
            aoAlterarTexto={aoAlterarNumero}
            keyboardType="numeric"
            inputMode="numeric"
            maxLength={8}
            placeholder="120"
            erro={erroNumero}
          />
        </View>
      </View>
    </>
  );
}
