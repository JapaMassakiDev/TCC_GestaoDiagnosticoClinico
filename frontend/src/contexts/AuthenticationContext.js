import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { atualizarPerfil, cadastrarUsuario, entrarComCpf, selecionarPapelAcesso } from "../services/authenticationService";
import { definirTokenApi } from "../services/api";

const ContextoAutenticacao = createContext(null);
const CHAVE_SESSAO = "saude-app:sessao";
const LIMITE_INATIVIDADE = 4 * 60 * 60 * 1000;

export function ProvedorAutenticacao({ children }) {
  const [usuario, definirUsuario] = useState(null);
  const [token, definirToken] = useState(null);
  const [carregando, definirCarregando] = useState(false);
  const [edicaoDiagnostico, definirEdicaoDiagnostico] = useState(null);
  const [sessaoPronta, definirSessaoPronta] = useState(false);
  const [selecaoPapel, definirSelecaoPapel] = useState(null);
  const [telaAtual, definirTelaAtual] = useState("Diagnósticos");
  const ultimaAtividade = useRef(Date.now());
  const ultimaPersistencia = useRef(0);

  const persistirSessao = useCallback(async (proximoUsuario, proximoToken, proximaTela = telaAtual) => {
    if (!proximoUsuario || !proximoToken) return AsyncStorage.removeItem(CHAVE_SESSAO);
    await AsyncStorage.setItem(CHAVE_SESSAO, JSON.stringify({
      usuario: proximoUsuario,
      token: proximoToken,
      telaAtual: proximaTela,
      ultimaAtividade: ultimaAtividade.current,
    }));
  }, [telaAtual]);

  const finalizarLogin = useCallback(async (dados, papelForcado) => {
    const usuarioFinal = { ...dados.user, role: papelForcado || dados.user.role, papel: papelForcado || dados.user.papel };
    definirUsuario(usuarioFinal);
    definirToken(dados.token);
    definirTokenApi(dados.token);
    definirSelecaoPapel(null);
    ultimaAtividade.current = Date.now();
    await persistirSessao(usuarioFinal, dados.token, "Diagnósticos");
    return { ...dados, user: usuarioFinal };
  }, [persistirSessao]);

  useEffect(() => {
    AsyncStorage.getItem(CHAVE_SESSAO).then(async (valor) => {
      if (!valor) return;
      try {
        const salva = JSON.parse(valor);
        if (!salva.usuario || !salva.token || Date.now() - salva.ultimaAtividade >= LIMITE_INATIVIDADE) {
          await AsyncStorage.removeItem(CHAVE_SESSAO);
          return;
        }
        ultimaAtividade.current = salva.ultimaAtividade;
        definirUsuario(salva.usuario);
        definirToken(salva.token);
        definirTokenApi(salva.token);
        definirTelaAtual(salva.telaAtual || "Diagnósticos");
      } catch {
        await AsyncStorage.removeItem(CHAVE_SESSAO);
      }
    }).finally(() => definirSessaoPronta(true));
  }, []);

  const registrarAtividade = useCallback(() => {
    if (!usuario || !token) return;
    ultimaAtividade.current = Date.now();
    if (Date.now() - ultimaPersistencia.current >= 30000) {
      ultimaPersistencia.current = Date.now();
      persistirSessao(usuario, token);
    }
  }, [persistirSessao, token, usuario]);

  useEffect(() => {
    if (!usuario) return undefined;
    const temporizador = setInterval(() => {
      if (Date.now() - ultimaAtividade.current >= LIMITE_INATIVIDADE) sair(true);
    }, 60000);
    return () => clearInterval(temporizador);
  }, [usuario]);

  async function entrar(cpf, senha) {
    definirCarregando(true);
    try {
      const dados = await entrarComCpf({ cpf, senha });
      definirTokenApi(dados.token);
      if ((dados.papeis || []).length > 1) {
        definirSelecaoPapel(dados);
        return { ...dados, requerSelecaoPapel: true };
      }
      return finalizarLogin(dados, dados.papeis?.[0]);
    } finally {
      definirCarregando(false);
    }
  }

  async function cadastrar(dadosCadastro) {
    definirCarregando(true);
    try {
      const dados = await cadastrarUsuario(dadosCadastro);
      if ((dados.papeis || dados.user?.papeis || []).length > 1) {
        definirTokenApi(dados.token);
        definirSelecaoPapel(dados);
        return { ...dados, requerSelecaoPapel: true };
      }
      return finalizarLogin(dados, dados.user?.role);
    } finally {
      definirCarregando(false);
    }
  }

  async function salvarPerfil(dadosPerfil) {
    definirCarregando(true);
    try {
      const dados = await atualizarPerfil(usuario.id, dadosPerfil);
      definirUsuario({ ...dados.user });
      return dados.user;
    } finally {
      definirCarregando(false);
    }
  }

  async function escolherPapel({ papel, crm, cnpj }) {
    if (!selecaoPapel) throw new Error("Não há autenticação aguardando seleção de papel.");
    if (papel === "paciente") return finalizarLogin(selecaoPapel, papel);
    definirCarregando(true);
    try {
      definirTokenApi(selecaoPapel.token);
      const dados = await selecionarPapelAcesso({ papel, crm, cnpj });
      return finalizarLogin({ token: dados.token || selecaoPapel.token, user: { ...selecaoPapel.user, ...dados.user } }, papel);
    } finally {
      definirCarregando(false);
    }
  }

  async function sair(forcar = false) {
    if (edicaoDiagnostico && !forcar) return false;
    definirUsuario(null);
    definirToken(null);
    definirSelecaoPapel(null);
    definirTokenApi(null);
    await AsyncStorage.removeItem(CHAVE_SESSAO);
    return true;
  }

  async function registrarTela(nomeTela) {
    definirTelaAtual(nomeTela);
    ultimaAtividade.current = Date.now();
    await persistirSessao(usuario, token, nomeTela);
  }

  const valorContexto = {
    usuario,
    token,
    carregando,
    entrar,
    cadastrar,
    salvarPerfil,
    sair,
    sessaoPronta,
    selecaoPapel,
    escolherPapel,
    telaAtual,
    registrarTela,
    registrarAtividade,
    edicaoDiagnostico,
    iniciarEdicaoDiagnostico: definirEdicaoDiagnostico,
    concluirEdicaoDiagnostico: () => definirEdicaoDiagnostico(null),
    // aliases temporários para não quebrar integrações externas existentes.
    user: usuario,
    loading: carregando,
    signIn: entrar,
    signUp: cadastrar,
    saveProfile: salvarPerfil,
    signOut: sair,
  };

  return <ContextoAutenticacao.Provider value={valorContexto}>{children}</ContextoAutenticacao.Provider>;
}

export function usarAutenticacao() {
  const contexto = useContext(ContextoAutenticacao);
  if (!contexto) throw new Error("usarAutenticacao deve ser usado dentro de ProvedorAutenticacao");
  return contexto;
}
