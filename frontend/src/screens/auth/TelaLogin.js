import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Tela from "../../components/Tela";
import CampoApp from "../../components/CampoApp";
import CampoCpf from "../../components/CampoCpf";
import BotaoPrimario from "../../components/BotaoPrimario";
import { verificarCpf } from "../../services/authenticationService";
import { somenteDigitos } from "../../utils/masks";
import { usarAutenticacao } from "../../contexts/AuthenticationContext";

export default function TelaLogin({ navigation: navegacao }) {
  const { entrar, carregando } = usarAutenticacao();
  const [cpf, definirCpf] = useState("");
  const [senha, definirSenha] = useState("");
  const [erros, definirErros] = useState({ cpf: "", senha: "", geral: "" });

  function atualizarCpf(valor) {
    definirCpf(valor);
    definirErros((atual) => ({ ...atual, cpf: "", geral: "" }));
  }

  function atualizarSenha(valor) {
    definirSenha(valor);
    definirErros((atual) => ({ ...atual, senha: "", geral: "" }));
  }

  async function entrarNoApp() {
    const cpfLimpo = somenteDigitos(cpf);
    const proximosErros = { cpf: "", senha: "", geral: "" };

    if (cpfLimpo.length !== 11) {
      proximosErros.cpf = "CPF incompleto. Preencha os 11 números.";
    }

    if (!senha) {
      proximosErros.senha = "Informe sua senha.";
    }

    if (proximosErros.cpf || proximosErros.senha) {
      definirErros(proximosErros);
      return;
    }

    try {
      const resultado = await verificarCpf(cpfLimpo);

      if (!resultado.exists) {
        navegacao.navigate("Cadastro", { cpf: cpfLimpo });
        return;
      }

      await entrar(cpfLimpo, senha);
      definirErros({ cpf: "", senha: "", geral: "" });
    } catch (erro) {
      definirErros({
        cpf: "",
        senha: "Senha incorreta para este CPF. Digite novamente.",
        geral: erro.message,
      });
    }
  }

  return (
    <Tela>
      <View className="mx-auto w-full max-w-[520px]">
        <View className="mb-7 mt-8 items-center">
          <View
            className="mb-4 h-20 w-20 items-center justify-center rounded-3xl bg-mint-200"
            accessibilityLabel="Logo Saúde APP"
          >
            <Ionicons name="medical" size={42} color="#357257" />
          </View>
          <Text className="text-3xl font-black text-ink">Saúde APP</Text>
          <Text className="mt-2 text-center text-slate-500">
            Informação clínica simples, organizada e segura.
          </Text>
        </View>

        <View className="rounded-[28px] border border-mint-100 bg-white p-6 hover:shadow-xl transition-all duration-200">
          <Text className="text-2xl font-bold text-ink">Entrar</Text>
          <Text className="mb-6 mt-2 text-slate-500">
            Se o CPF ainda não existir, você será levado automaticamente ao cadastro.
          </Text>

          <CampoCpf
            rotulo="CPF"
            valor={cpf}
            aoAlterarTexto={atualizarCpf}
            erro={erros.cpf}
            mostrarConfirmacao={false}
          />

          <CampoApp
            rotulo="Senha"
            valor={senha}
            aoAlterarTexto={atualizarSenha}
            secureTextEntry
            placeholder="Digite sua senha"
            erro={erros.senha}
          />

          {erros.geral ? (
            <View className="mb-4 rounded-2xl bg-red-50 p-3">
              <Text className="text-sm font-semibold text-red-600">{erros.geral}</Text>
            </View>
          ) : null}

          <BotaoPrimario titulo="Entrar" aoPressionar={entrarNoApp} carregando={carregando} />

          <Pressable onPress={() => navegacao.navigate("EsqueciSenha")} className="mt-5 items-center">
            <Text className="font-semibold text-mint-700">Esqueceu a senha?</Text>
          </Pressable>

          <View className="mt-5 flex-row justify-center">
            <Text className="text-slate-500">Não tem uma conta? </Text>
            <Pressable onPress={() => navegacao.navigate("Cadastro")}>
              <Text className="font-bold text-mint-700">Crie uma</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Tela>
  );
}
