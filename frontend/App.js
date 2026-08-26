import { useState } from "react";

import "./global.css";

import LoginScreen from "./src/screens/LoginScreen.js";
import CadastroScreen from "./src/screens/CadastroScreen";

export default function App() {
  const [tela, setTela] = useState("login");

  const [cpfParaCadastro, setCpfParaCadastro] =
    useState("");

  function abrirCadastro(cpf) {
    setCpfParaCadastro(cpf || "");
    setTela("cadastro");
  }

  function abrirLogin() {
    setCpfParaCadastro("");
    setTela("login");
  }

  function loginSucesso(usuario) {
    console.log(
      "Usuário autenticado:",
      usuario
    );

    /*
      Aqui posteriormente você pode:

      - salvar o token
      - abrir a Home
      - usar Context API
      - usar AsyncStorage
      - carregar os dados do usuário
    */
  }

  function cadastroSucesso(usuario) {
    console.log(
      "Usuário cadastrado:",
      usuario
    );

    /*
      Depois do cadastro você pode
      automaticamente autenticar o usuário
      ou voltar para o login.
    */

    setTela("login");
  }

  if (tela === "cadastro") {
    return (
      <CadastroScreen
        cpfInicial={cpfParaCadastro}
        onVoltarLogin={abrirLogin}
        onCadastroSucesso={cadastroSucesso}
      />
    );
  }

  return (
    <LoginScreen
      onIrParaCadastro={abrirCadastro}
      onLoginSucesso={loginSucesso}
    />
  );
}