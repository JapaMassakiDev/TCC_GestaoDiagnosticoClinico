import React, { useState } from "react";
import { Alert, View } from "react-native";
import Tela from "../../components/Tela";
import CabecalhoApp from "../../components/CabecalhoApp";
import CampoApp from "../../components/CampoApp";
import BotaoPrimario from "../../components/BotaoPrimario";
import { enviarEmailRedefinicao } from "../../services/authenticationService";

export default function TelaEsqueciSenha({ navigation: navegacao }) {
  const [email, definirEmail] = useState("");
  const [carregando, definirCarregando] = useState(false);

  async function enviar() {
    if (!email.trim()) return Alert.alert("E-mail", "Informe seu e-mail.");
    definirCarregando(true);
    try {
      const resultado = await enviarEmailRedefinicao(email.trim());
      Alert.alert("E-mail enviado", "O link de redefinição foi solicitado.");
      navegacao.navigate("RedefinirSenha", { usuarioId: resultado.userId ?? resultado.usuarioId });
    } catch (erro) {
      Alert.alert("Erro", erro.message);
    } finally {
      definirCarregando(false);
    }
  }

  return (
    <Tela>
      <View className="mx-auto w-full max-w-[520px]">
        <CabecalhoApp
          titulo="Esqueci minha senha"
          subtitulo="Informe o e-mail cadastrado para solicitar a redefinição."
          aoVoltar={() => navegacao.goBack()}
        />
        <View className="rounded-3xl border border-mint-100 bg-white p-5 hover:shadow-xl transition-all duration-200">
          <CampoApp rotulo="E-mail" valor={email} aoAlterarTexto={definirEmail} autoCapitalize="none" keyboardType="email-address" inputMode="email" placeholder="voce@email.com" />
          <BotaoPrimario titulo="Enviar e-mail" aoPressionar={enviar} carregando={carregando} />
        </View>
      </View>
    </Tela>
  );
}
