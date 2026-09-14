import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Tela from "../../components/Tela";
import CampoApp from "../../components/CampoApp";
import CampoCnpj from "../../components/CampoCnpj";
import BotaoPrimario from "../../components/BotaoPrimario";
import { usarAutenticacao } from "../../contexts/AuthenticationContext";
import { consultarCnpj } from "../../services/cnpjService";
import { mascararCrm, somenteDigitos } from "../../utils/masks";

const configuracao = {
  paciente: { titulo: "Paciente", icone: "person-outline" },
  medico: { titulo: "Médico", icone: "medical-outline" },
  dono: { titulo: "Unidade", icone: "business-outline" },
};

export default function TelaSelecionarPapel() {
  const { selecaoPapel, escolherPapel, carregando } = usarAutenticacao();
  const [papel, definirPapel] = useState("");
  const [credencial, definirCredencial] = useState("");
  const [erro, definirErro] = useState("");
  const [cnpjStatus, definirCnpjStatus] = useState("idle");
  const [cnpjValidado, definirCnpjValidado] = useState("");
  const papeis = selecaoPapel?.papeis ?? selecaoPapel?.user?.papeis ?? [];

  useEffect(() => {
    let active = true;
    const cnpj = somenteDigitos(credencial);

    if (papel !== "dono" || cnpj.length !== 14) {
      definirCnpjStatus("idle");
      definirCnpjValidado("");
      return () => {
        active = false;
      };
    }

    definirCnpjStatus("checking");
    const timer = setTimeout(async () => {
      try {
        await consultarCnpj(cnpj);
        if (!active) return;
        definirCnpjStatus("valid");
        definirCnpjValidado(cnpj);
        definirErro("");
      } catch (error) {
        if (!active) return;
        definirCnpjStatus("invalid");
        definirCnpjValidado("");
        definirErro(error.message || "Não foi possível validar o CNPJ.");
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [credencial, papel]);

  async function selecionar(proximoPapel) {
    definirErro("");
    definirCredencial("");
    definirCnpjStatus("idle");
    definirCnpjValidado("");
    if (proximoPapel === "paciente") {
      try { await escolherPapel({ papel: proximoPapel }); }
      catch (e) { definirErro(e.message); }
      return;
    }
    definirPapel(proximoPapel);
  }

  async function confirmar() {
    const digitos = somenteDigitos(credencial);
    if (papel === "medico" && digitos.length < 4) return definirErro("Informe o CRM vinculado a este CPF.");
    if (papel === "dono" && digitos.length !== 14) return definirErro("Informe os 14 números do CNPJ da unidade.");
    try {
      if (papel === "dono" && (cnpjStatus !== "valid" || cnpjValidado !== digitos)) {
        await consultarCnpj(digitos);
        definirCnpjStatus("valid");
        definirCnpjValidado(digitos);
      }
      await escolherPapel({ papel, crm: papel === "medico" ? digitos : undefined, cnpj: papel === "dono" ? digitos : undefined });
    } catch (e) {
      definirErro(e.message || "Não foi possível validar o papel selecionado.");
    }
  }

  return (
    <Tela>
      <View className="mx-auto w-full max-w-[620px]">
        <Text className="mt-8 text-3xl font-black text-ink">Como deseja acessar?</Text>
        <Text className="mb-6 mt-2 text-slate-500">Este CPF possui mais de um tipo de cadastro.</Text>
        <View className="flex-row flex-wrap gap-3">
          {papeis.map((item) => {
            const dados = configuracao[item] || { titulo: item, icone: "person-outline" };
            return (
              <Pressable key={item} onPress={() => selecionar(item)} className={`min-w-[150px] flex-1 items-center rounded-2xl border p-5 ${papel === item ? "border-mint-500 bg-mint-100" : "border-mint-100 bg-white"}`}>
                <Ionicons name={dados.icone} size={27} color="#357257" />
                <Text className="mt-2 font-black text-ink">{dados.titulo}</Text>
              </Pressable>
            );
          })}
        </View>

        {papel === "medico" ? <View className="mt-5"><CampoApp rotulo="Confirme seu CRM" valor={credencial} aoAlterarTexto={(v) => definirCredencial(mascararCrm(v))} keyboardType="numeric" inputMode="numeric" maxLength={6} erro={erro} /><BotaoPrimario titulo="Acessar como médico" aoPressionar={confirmar} carregando={carregando} /></View> : null}
        {papel === "dono" ? <View className="mt-5"><CampoCnpj rotulo="Confirme o CNPJ da unidade" valor={credencial} aoAlterarTexto={(v) => { definirCredencial(v); definirErro(""); definirCnpjStatus("idle"); definirCnpjValidado(""); }} status={cnpjStatus} erro={erro} /><BotaoPrimario titulo="Acessar como unidade" aoPressionar={confirmar} carregando={carregando} /></View> : null}
        {erro && !papel ? <Text className="mt-4 text-sm font-semibold text-red-500">{erro}</Text> : null}
      </View>
    </Tela>
  );
}
