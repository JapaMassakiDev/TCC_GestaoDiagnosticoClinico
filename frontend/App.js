import "react-native-gesture-handler";
import "./global.css";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Platform, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ProvedorAutenticacao, usarAutenticacao } from "./src/contexts/AuthenticationContext";
import NavegadorRaiz from "./src/navigation/RootNavigator";

const linking = {
  prefixes: [],
  config: {
    screens: {
      Login: "login",
      EsqueciSenha: "esqueci-senha",
      RedefinirSenha: "redefinir-senha",
      Cadastro: "cadastro",
      SelecionarPapel: "selecionar-papel",
      Principal: {
        screens: {
          Diagnósticos: "diagnosticos",
          Criar: "criar",
          Gestão: "gestao",
          Perfil: "perfil",
        },
      },
    },
  },
};

function AplicacaoComSessao() {
  const { usuario, sessaoPronta, registrarAtividade, sair } = usarAutenticacao();

  React.useEffect(() => {
    if (Platform.OS !== "web") return undefined;
    const eventos = ["click", "keydown", "mousemove", "touchstart", "scroll"];
    eventos.forEach((evento) => window.addEventListener(evento, registrarAtividade, { passive: true }));
    const aoNavegarHistorico = () => {
      const estaNoLogin = window.location.pathname === "/login" || window.location.pathname === "/";
      if (usuario && estaNoLogin) sair(true);
      else if (!usuario && !estaNoLogin) window.history.replaceState({}, "", "/login");
    };
    window.addEventListener("popstate", aoNavegarHistorico);
    return () => {
      eventos.forEach((evento) => window.removeEventListener(evento, registrarAtividade));
      window.removeEventListener("popstate", aoNavegarHistorico);
    };
  }, [registrarAtividade, sair, usuario]);

  if (!sessaoPronta) {
    return <View className="flex-1 items-center justify-center bg-[#FBFAF5]"><ActivityIndicator color="#3F8F68" /></View>;
  }

  return (
    <View className="flex-1" onTouchStart={registrarAtividade}>
      <NavigationContainer linking={linking}>
        <StatusBar style="dark" />
        <NavegadorRaiz />
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ProvedorAutenticacao>
        <AplicacaoComSessao />
      </ProvedorAutenticacao>
    </SafeAreaProvider>
  );
}
