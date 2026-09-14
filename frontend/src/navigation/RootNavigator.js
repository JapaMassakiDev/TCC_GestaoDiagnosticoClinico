import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { usarAutenticacao } from "../contexts/AuthenticationContext";
import TelaLogin from "../screens/auth/TelaLogin";
import TelaEsqueciSenha from "../screens/auth/TelaEsqueciSenha";
import TelaRedefinirSenha from "../screens/auth/TelaRedefinirSenha";
import TelaCadastro from "../screens/auth/TelaCadastro";
import TelaSelecionarPapel from "../screens/auth/TelaSelecionarPapel";
import AbasApp from "./AppTabs";
const Stack = createNativeStackNavigator();
export default function NavegadorRaiz() {
  const { usuario, selecaoPapel } = usarAutenticacao();
  return <Stack.Navigator screenOptions={{ headerShown: false }}>{!usuario ? <>{selecaoPapel ? <Stack.Screen name="SelecionarPapel" component={TelaSelecionarPapel}/> : <><Stack.Screen name="Login" component={TelaLogin}/><Stack.Screen name="EsqueciSenha" component={TelaEsqueciSenha}/><Stack.Screen name="RedefinirSenha" component={TelaRedefinirSenha}/><Stack.Screen name="Cadastro" component={TelaCadastro}/></>}</> : <Stack.Screen name="Principal" component={AbasApp}/>}</Stack.Navigator>;
}
