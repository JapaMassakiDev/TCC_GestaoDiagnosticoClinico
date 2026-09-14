import React, { useEffect, useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, Text, View, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Tela from "../../components/Tela";
import CampoApp from "../../components/CampoApp";
import CampoCpf from "../../components/CampoCpf";
import CampoCnpj from "../../components/CampoCnpj";
import CampoSelecaoData from "../../components/CampoSelecaoData";
import SeletorSexo from "../../components/SeletorSexo";
import BotaoPrimario from "../../components/BotaoPrimario";
import CamposLocalizacaoUnidade from "../../components/CamposLocalizacaoUnidade";
import { buscarCep, validarEnderecoCep } from "../../services/cepService";
import { usarAutenticacao } from "../../contexts/AuthenticationContext";
import { usarAutorizacoes } from "../../contexts/AuthorizationContext";
import { verificarCpf } from "../../services/authenticationService";
import { consultarCnpj } from "../../services/cnpjService";
import {
  dataBrParaIso,
  dataBrPassadaOuHoje,
  dataBrValida,
  mascararCnpj,
  mascararCpf,
  mascararCrm,
  mascararTelefone,
  somenteDigitos,
} from "../../utils/masks";

export default function TelaPerfil() {
  const { usuario, salvarPerfil, sair, carregando, edicaoDiagnostico } = usarAutenticacao();
  const { quantidadePendentes, abrirAutorizacoes } = usarAutorizacoes();
  const [editVisible, setEditVisible] = useState(false);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [cnpjStatus, setCnpjStatus] = useState("idle");
  const [cnpjValidado, setCnpjValidado] = useState("");
  
  const ownerUnit = useMemo(
    () => (usuario.role === "dono" && usuario.unitName ? { name: usuario.unitName, cnpj: usuario.cnpj, cep: usuario.cep, address: usuario.address, number: usuario.number, phone: usuario.unitPhone, logoUri: usuario.logoUri } : null),
    [usuario]
  );

  useEffect(() => {
    let active = true;
    const cnpj = somenteDigitos(form.cnpj || "");

    if (!editVisible || usuario.role !== "dono" || cnpj.length !== 14) {
      setCnpjStatus("idle");
      setCnpjValidado("");
      return () => {
        active = false;
      };
    }

    setCnpjStatus("checking");
    const timer = setTimeout(async () => {
      try {
        await consultarCnpj(cnpj);
        if (!active) return;
        setCnpjStatus("valid");
        setCnpjValidado(cnpj);
        setErrors((atuais) => ({ ...atuais, cnpj: "" }));
      } catch (error) {
        if (!active) return;
        setCnpjStatus("invalid");
        setCnpjValidado("");
        setErrors((atuais) => ({ ...atuais, cnpj: error.message || "Não foi possível validar o CNPJ." }));
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [editVisible, form.cnpj, usuario.role]);

  function openEdit() {
    setErrors({});
    setCnpjStatus("idle");
    setCnpjValidado("");
    setForm({
      name: usuario.name || "",
      email: usuario.email || "",
      cpf: mascararCpf(usuario.cpf || ""),
      password: "",
      phone: mascararTelefone(usuario.phone || ownerUnit?.phone || ""),
      sex: usuario.sex || "",
      birthDate: usuario.birthDate ? usuario.birthDate.split("-").reverse().join("/") : "",
      crm: mascararCrm(usuario.crm || ""),
      cnpj: mascararCnpj(usuario.cnpj || ownerUnit?.cnpj || ""),
      unitName: ownerUnit?.name || "",
      cep: ownerUnit?.cep || "",
      address: ownerUnit?.address || "",
      number: ownerUnit?.number || "",
      logoUri: ownerUnit?.logoUri || null,
    });
    setEditVisible(true);
  }

  async function pickLogo() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setForm((current) => ({ ...current, logoUri: result.assets[0].uri }));
  }

  async function save() {
    const nextErrors = {};
    const cpfDigits = somenteDigitos(form.cpf);

    if (!form.name?.trim()) nextErrors.name = "Informe seu nome completo.";
    if (!form.email?.trim()) nextErrors.email = "Informe seu e-mail.";
    if (cpfDigits.length !== 11) nextErrors.cpf = "CPF incompleto. Preencha os 11 números.";
    if (form.password && form.password.length < 6) nextErrors.password = "A nova senha deve ter no mínimo 6 caracteres.";

    if (cpfDigits.length === 11 && cpfDigits !== usuario.cpf) {
      const result = await verificarCpf(cpfDigits);
      if (result.exists) nextErrors.cpf = "Este CPF já pertence a outro cadastro.";
    }

    if (usuario.role === "paciente") {
      if (!form.sex) nextErrors.sex = "Selecione o sexo.";
      else if (form.sex === "Outro") nextErrors.sex = "Escreva sua identificação no campo Outro.";
      if (somenteDigitos(form.phone).length < 10) nextErrors.phone = "Informe um telefone válido.";
      if (!dataBrValida(form.birthDate)) nextErrors.birthDate = "Informe uma data de nascimento válida.";
      else if (!dataBrPassadaOuHoje(form.birthDate)) nextErrors.birthDate = "A data de nascimento não pode estar no futuro.";
    }

    if (usuario.role === "medico" && somenteDigitos(form.crm).length < 4) {
      nextErrors.crm = "Informe o CRM do médico.";
    }

    if (usuario.role === "dono") {
      const cnpj = somenteDigitos(form.cnpj);
      if (cnpj.length !== 14) nextErrors.cnpj = "Informe os 14 números do CNPJ.";
      else if (cnpjStatus !== "valid" || cnpjValidado !== cnpj) {
        try {
          await consultarCnpj(cnpj);
          setCnpjStatus("valid");
          setCnpjValidado(cnpj);
        } catch (error) {
          nextErrors.cnpj = error.message || "Não foi possível validar o CNPJ.";
          setCnpjStatus("invalid");
        }
      }
      if (!form.unitName?.trim()) nextErrors.unitName = "Informe o nome da unidade.";
      if (somenteDigitos(form.cep).length !== 8) nextErrors.cep = "Informe e selecione um CEP válido.";
      else if (!(await buscarCep(form.cep))) nextErrors.cep = "CEP não localizado.";
      if (!form.address?.trim()) nextErrors.address = "Informe o endereço da unidade.";
      if (!form.number?.trim()) nextErrors.number = "Informe o número da unidade.";
      if (somenteDigitos(form.phone).length < 10) nextErrors.phone = "Informe o telefone da unidade.";
      if (!nextErrors.cep && !nextErrors.address) {
        const coherence = await validarEnderecoCep(form.cep, form.address);
        if (!coherence.valid) nextErrors.address = coherence.reason;
      }
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        cpf: form.cpf,
      };
      if (form.password) payload.password = form.password;

      if (usuario.role === "paciente") {
        payload.sex = form.sex;
        payload.phone = form.phone;
        payload.birthDate = dataBrParaIso(form.birthDate);
      }
      if (usuario.role === "medico") payload.crm = form.crm;
      if (usuario.role === "dono") {
        payload.cnpj = form.cnpj;
        payload.unitName = form.unitName.trim();
        payload.cep = form.cep;
        payload.address = form.address.trim();
        payload.number = form.number.trim();
        payload.phone = form.phone;
        payload.logoUri = form.logoUri;
      }

      await salvarPerfil(payload);
      setEditVisible(false);
      Alert.alert("Perfil", "Informações atualizadas no mock.");
    } catch (error) {
      Alert.alert("Perfil", error.message);
    }
  }

  return (
    <Tela>
      <View className="mx-auto w-full max-w-[560px]">
        <View className="mt-8 items-center">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-mint-200">
            <Ionicons name="person" size={46} color="#357257" />
          </View>
          <Text className="mt-5 text-2xl font-black text-ink">{usuario.name}</Text>
          <Text className="mt-1 capitalize text-mint-700">{usuario.role}</Text>
        </View>

        <View className="my-7 rounded-3xl border border-mint-100 bg-white p-5 hover:shadow-xl transition-all duration-200">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-black text-ink">Informações</Text>
            <View className="flex-row gap-2">
              <Pressable onPress={abrirAutorizacoes} accessibilityLabel="Abrir notificações de autorização" className="relative h-10 w-10 items-center justify-center rounded-full bg-mint-50">
                <Ionicons name="notifications-outline" size={20} color="#357257" />
                {quantidadePendentes ? <View className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-red-500" /> : null}
              </Pressable>
              <Pressable onPress={openEdit} accessibilityLabel="Editar perfil" className="h-10 w-10 items-center justify-center rounded-full bg-mint-50">
                <Ionicons name="pencil" size={19} color="#357257" />
              </Pressable>
            </View>
          </View>
          <Text className="text-xs font-bold uppercase text-slate-400">E-mail</Text><Text className="mt-1 text-base text-ink">{usuario.email}</Text>
          <Text className="mt-5 text-xs font-bold uppercase text-slate-400">CPF</Text><Text className="mt-1 text-base text-ink">{mascararCpf(usuario.cpf)}</Text>
          {usuario.role === "paciente" ? <>
            <Text className="mt-5 text-xs font-bold uppercase text-slate-400">Sexo</Text><Text className="mt-1 text-base text-ink">{usuario.sex || "-"}</Text>
            <Text className="mt-5 text-xs font-bold uppercase text-slate-400">Telefone</Text><Text className="mt-1 text-base text-ink">{mascararTelefone(usuario.phone || "") || "-"}</Text>
            <Text className="mt-5 text-xs font-bold uppercase text-slate-400">Nascimento</Text><Text className="mt-1 text-base text-ink">{usuario.birthDate ? usuario.birthDate.split("-").reverse().join("/") : "-"}</Text>
          </> : null}
          {usuario.role === "medico" ? <><Text className="mt-5 text-xs font-bold uppercase text-slate-400">CRM</Text><Text className="mt-1 text-base text-ink">{usuario.crm || "-"}</Text></> : null}
          {ownerUnit ? <>
            <Text className="mt-5 text-xs font-bold uppercase text-slate-400">CNPJ</Text><Text className="mt-1 text-base text-ink">{mascararCnpj(ownerUnit.cnpj || usuario.cnpj || "")}</Text>
            <Text className="mt-5 text-xs font-bold uppercase text-slate-400">Unidade</Text><Text className="mt-1 text-base text-ink">{ownerUnit.name}</Text>
            <Text className="mt-5 text-xs font-bold uppercase text-slate-400">CEP</Text><Text className="mt-1 text-base text-ink">{ownerUnit.cep || "-"}</Text>
            <Text className="mt-2 text-sm text-slate-500">{ownerUnit.address}{ownerUnit.number ? `, ${ownerUnit.number}` : ""}</Text><Text className="text-sm text-slate-500">{ownerUnit.phone}</Text>
          </> : null}
        </View>
        <BotaoPrimario
          titulo={edicaoDiagnostico ? "Sair bloqueado durante a edição" : "Sair"}
          icone={edicaoDiagnostico ? "lock-closed" : "log-out-outline"}
          variante="secondary"
          aoPressionar={sair}
          desabilitado={!!edicaoDiagnostico}
        />
      </View>

      <Modal visible={editVisible} transparent animationType="fade" onRequestClose={() => setEditVisible(false)}>
        <View className="flex-1 items-center justify-center bg-black/40 p-5">
          <ScrollView className="max-h-[90%] w-full max-w-[620px] rounded-3xl bg-white hover:shadow-xl transition-all duration-200">
            <View className="p-6">
              <View className="mb-5 flex-row items-center justify-between">
                <Text className="text-2xl font-black text-ink">Editar perfil</Text>
                <Pressable onPress={() => setEditVisible(false)}><Ionicons name="close" size={24} color="#64748B" /></Pressable>
              </View>

              <CampoApp rotulo="Nome completo" valor={form.name || ""} aoAlterarTexto={(v) => { setForm((f) => ({ ...f, name: v })); setErrors((e) => ({ ...e, name: "" })); }} autoCapitalize="words" erro={errors.name} />
              <CampoApp rotulo="E-mail" valor={form.email || ""} aoAlterarTexto={(v) => { setForm((f) => ({ ...f, email: v })); setErrors((e) => ({ ...e, email: "" })); }} keyboardType="email-address" inputMode="email" autoCapitalize="none" erro={errors.email} />
              <CampoCpf rotulo="CPF" valor={form.cpf || ""} aoAlterarTexto={(v) => { setForm((f) => ({ ...f, cpf: v })); setErrors((e) => ({ ...e, cpf: "" })); }} erro={errors.cpf} />

              {usuario.role === "paciente" ? <>
                <SeletorSexo
                  valor={form.sex || ""}
                  aoAlterar={(v) => { setForm((f) => ({ ...f, sex: v })); setErrors((e) => ({ ...e, sex: "" })); }}
                  erro={errors.sex}
                />
                <CampoApp rotulo="Telefone" valor={form.phone || ""} aoAlterarTexto={(v) => { setForm((f) => ({ ...f, phone: mascararTelefone(v) })); setErrors((e) => ({ ...e, phone: "" })); }} keyboardType="phone-pad" inputMode="tel" maxLength={15} erro={errors.phone} />
                <CampoSelecaoData
                  rotulo="Data de nascimento"
                  valor={form.birthDate || ""}
                  aoAlterar={(v) => { setForm((f) => ({ ...f, birthDate: v })); setErrors((e) => ({ ...e, birthDate: "" })); }}
                  anoMaximo={new Date().getFullYear()}
                  dataMaxima={new Date()}
                  erro={errors.birthDate}
                />
              </> : null}

              {usuario.role === "medico" ? <CampoApp rotulo="CRM" valor={form.crm || ""} aoAlterarTexto={(v) => { setForm((f) => ({ ...f, crm: mascararCrm(v) })); setErrors((e) => ({ ...e, crm: "" })); }} keyboardType="numeric" inputMode="numeric" maxLength={6} erro={errors.crm} /> : null}

              {usuario.role === "dono" ? <>
                <View className="mb-2 mt-2 rounded-2xl bg-mint-50 p-4">
                  <Text className="mb-4 font-black text-mint-800">Dados da unidade</Text>
                  <CampoCnpj rotulo="CNPJ" valor={form.cnpj || ""} aoAlterarTexto={(v) => { setForm((f) => ({ ...f, cnpj: v })); setErrors((e) => ({ ...e, cnpj: "" })); setCnpjStatus("idle"); setCnpjValidado(""); }} status={cnpjStatus} erro={errors.cnpj} />
                  <CampoApp rotulo="Nome da unidade" valor={form.unitName || ""} aoAlterarTexto={(v) => { setForm((f) => ({ ...f, unitName: v })); setErrors((e) => ({ ...e, unitName: "" })); }} erro={errors.unitName} />
                  <CamposLocalizacaoUnidade
                    cep={form.cep || ""}
                    endereco={form.address || ""}
                    numero={form.number || ""}
                    telefone={form.phone || ""}
                    aoAlterarCep={(value) => {
                      setForm((f) => ({ ...f, cep: value }));
                      setErrors((e) => ({ ...e, cep: "", address: "" }));
                    }}
                    aoAlterarEndereco={(value) => {
                      setForm((f) => ({ ...f, address: value }));
                      setErrors((e) => ({ ...e, address: "" }));
                    }}
                    aoAlterarNumero={(value) => {
                      setForm((f) => ({ ...f, number: somenteDigitos(value).slice(0, 8) }));
                      setErrors((e) => ({ ...e, number: "" }));
                    }}
                    aoAlterarTelefone={(value) => {
                      setForm((f) => ({ ...f, phone: value }));
                      setErrors((e) => ({ ...e, phone: "" }));
                    }}
                    aoSelecionarLocalizacao={(item) => {
                      setForm((f) => ({ ...f, cep: item.cep, address: item.formattedAddress }));
                      setErrors((e) => ({ ...e, cep: "", address: "" }));
                    }}
                    erroCep={errors.cep}
                    erroEndereco={errors.address}
                    erroNumero={errors.number}
                    erroTelefone={errors.phone}
                  />
                  <Text className="mb-2 font-semibold text-ink">Logo da unidade</Text>
                  <Pressable onPress={pickLogo} className="mb-4 items-center rounded-2xl border border-dashed border-mint-300 bg-white p-4">
                    {form.logoUri ? <Image source={{ uri: form.logoUri }} className="mb-2 h-20 w-20 rounded-2xl" resizeMode="contain" /> : null}
                    <Text className="font-bold text-mint-700">{form.logoUri ? "Trocar logo" : "Anexar logo"}</Text>
                  </Pressable>
                </View>
              </> : null}

              <CampoApp rotulo="Nova senha (opcional)" valor={form.password || ""} aoAlterarTexto={(v) => { setForm((f) => ({ ...f, password: v })); setErrors((e) => ({ ...e, password: "" })); }} secureTextEntry placeholder="Deixe em branco para manter a atual" erro={errors.password} />

              <View className="gap-3">
                <BotaoPrimario titulo="Salvar alterações" aoPressionar={save} carregando={carregando} />
                <BotaoPrimario titulo="Cancelar" variante="secondary" aoPressionar={() => setEditVisible(false)} />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </Tela>
  );
}
