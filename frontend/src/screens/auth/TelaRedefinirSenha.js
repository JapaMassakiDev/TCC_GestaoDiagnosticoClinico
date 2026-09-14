import React, { useState } from "react";
import { Alert, View } from "react-native";
import Tela from "../../components/Tela";
import CabecalhoApp from "../../components/CabecalhoApp";
import CampoApp from "../../components/CampoApp";
import BotaoPrimario from "../../components/BotaoPrimario";
import { redefinirSenha } from "../../services/authenticationService";

export default function TelaRedefinirSenha({ navigation: navegacao, route: rota }) {
  const [senha, definirSenha] = useState("");
  const [confirmacao, definirConfirmacao] = useState("");
  const [carregando, definirCarregando] = useState(false);

  async function enviar() {
    if (senha.length < 6) return Alert.alert("Senha", "Use no mínimo 6 caracteres.");
    if (senha !== confirmacao) return Alert.alert("Senha", "As senhas não coincidem.");

    definirCarregando(true);
    try {
      await redefinirSenha(rota.params?.usuarioId, senha);
      Alert.alert("Senha atualizada", "Agora você já pode entrar com a nova senha.");
      navegacao.popToTop();
    } catch (erro) {
      Alert.alert("Erro", erro.message);
    } finally {
      definirCarregando(false);
    }
  }

  return (
    <Tela>
      <View className="mx-auto w-full max-w-[520px]">
        <CabecalhoApp titulo="Atualizar senha" subtitulo="Crie uma nova senha e confirme antes de enviar." aoVoltar={() => navegacao.navigate("Login")} />
        <View className="rounded-3xl border border-mint-100 bg-white p-5 hover:shadow-xl transition-all duration-200">
          <CampoApp rotulo="Nova senha" valor={senha} aoAlterarTexto={definirSenha} secureTextEntry placeholder="Mínimo 6 caracteres" />
          <CampoApp rotulo="Confirmar senha" valor={confirmacao} aoAlterarTexto={definirConfirmacao} secureTextEntry placeholder="Repita a nova senha" />
          <BotaoPrimario titulo="Enviar" aoPressionar={enviar} carregando={carregando} />
        </View>
      </View>
    </Tela>
  );
}
