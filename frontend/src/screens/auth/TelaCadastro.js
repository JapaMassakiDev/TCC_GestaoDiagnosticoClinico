import React, { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Tela from "../../components/Tela";
import CabecalhoApp from "../../components/CabecalhoApp";
import CampoApp from "../../components/CampoApp";
import CampoCpf from "../../components/CampoCpf";
import CampoCnpj from "../../components/CampoCnpj";
import CampoSelecaoData from "../../components/CampoSelecaoData";
import SeletorSexo from "../../components/SeletorSexo";
import BotaoPrimario from "../../components/BotaoPrimario";
import CamposLocalizacaoUnidade from "../../components/CamposLocalizacaoUnidade";
import { buscarCep, validarEnderecoCep } from "../../services/cepService";
import { usarAutenticacao } from "../../contexts/AuthenticationContext";
import { verificarCpf } from "../../services/authenticationService";
import { consultarCnpj } from "../../services/cnpjService";
import { mascararCpf, mascararCrm, mascararTelefone, dataBrParaIso, dataBrPassadaOuHoje, dataBrValida, somenteDigitos } from "../../utils/masks";

function OpcaoPerfil({ ativo, icone, titulo, subtitulo, aoPressionar }) {
  return (
    <Pressable
      onPress={aoPressionar}
      className={`min-w-[145px] flex-1 items-center rounded-2xl border p-4 ${
        ativo ? "border-mint-500 bg-mint-100" : "border-mint-100 bg-white"
      } hover:shadow-xl transition-all duration-200`}
    >
      <View
        className={`mb-2 h-11 w-11 items-center justify-center rounded-full ${
          ativo ? "bg-mint-600" : "bg-mint-50"
        }`}
      >
        <Ionicons name={icone} size={22} color={ativo ? "#FFFFFF" : "#357257"} />
      </View>
      <Text className={`font-black ${ativo ? "text-mint-800" : "text-ink"}`}>{titulo}</Text>
      <Text className="mt-1 text-center text-xs text-slate-500">{subtitulo}</Text>
      {ativo ? (
        <View className="mt-2 h-5 w-5 items-center justify-center rounded-full bg-mint-600">
          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
        </View>
      ) : null}
    </Pressable>
  );
}

export default function TelaCadastro({ navigation: navegacao, route }) {
  const { cadastrar, carregando } = usarAutenticacao();
  const [role, setRole] = useState("paciente");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState(mascararCpf(route.params?.cpf || ""));
  const [password, setPassword] = useState("");
  const [sex, setSex] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [crm, setCrm] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [unitName, setUnitName] = useState("");
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  const [number, setNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [logoUri, setLogoUri] = useState(null);
  const [cpfStatus, setCpfStatus] = useState("idle");
  const [cnpjStatus, setCnpjStatus] = useState("idle");
  const [cnpjValidado, setCnpjValidado] = useState("");
  const [cadastroCpf, setCadastroCpf] = useState({ existe: false, usuarioId: null, papeis: [] });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let active = true;
    const cleanCpf = somenteDigitos(cpf);

    if (cleanCpf.length !== 11) {
      setCpfStatus("idle");
      return () => {
        active = false;
      };
    }

    setCpfStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const result = await verificarCpf(cleanCpf);
        if (!active) return;
        const papeis = (result.papeis ?? result.roles ?? []).map((item) => String(item).toLowerCase());
        setCadastroCpf({ existe: !!result.exists, usuarioId: result.usuarioId ?? result.userId ?? result.id ?? null, papeis });
        setCpfStatus(result.exists ? "registered" : "available");
      } catch {
        if (active) setCpfStatus("idle");
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [cpf]);

  useEffect(() => {
    let active = true;
    const cleanCnpj = somenteDigitos(cnpj);

    if (role !== "dono" || cleanCnpj.length !== 14) {
      setCnpjStatus("idle");
      setCnpjValidado("");
      return () => {
        active = false;
      };
    }

    setCnpjStatus("checking");
    const timer = setTimeout(async () => {
      try {
        await consultarCnpj(cleanCnpj);
        if (!active) return;
        setCnpjStatus("valid");
        setCnpjValidado(cleanCnpj);
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
  }, [cnpj, role]);

  function alterarCpf(valor) {
    setCpf(valor);
    setCadastroCpf({ existe: false, usuarioId: null, papeis: [] });
    setErrors((atuais) => ({ ...atuais, cpf: "" }));
  }

  function selectRole(nextRole) {
    setRole(nextRole);
    setErrors({});
  }

  async function pickLogo() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) setLogoUri(result.assets[0].uri);
  }

  async function submit() {
    const nextErrors = {};
    const cleanCpf = somenteDigitos(cpf);

    if (!name.trim()) nextErrors.name = "Informe seu nome completo.";
    if (!email.trim()) nextErrors.email = "Informe seu e-mail.";
    if (cleanCpf.length !== 11) nextErrors.cpf = "CPF incompleto. Preencha os 11 números.";
    if (cadastroCpf.existe && cadastroCpf.papeis.includes(role)) nextErrors.cpf = `Este CPF já possui o papel ${role}. Não é permitido cadastrar o mesmo tipo novamente.`;
    if (cadastroCpf.existe && !cadastroCpf.usuarioId) nextErrors.cpf = "O CPF existe, mas o backend não retornou usuarioId e papéis para permitir a atualização.";
    if (password.length < 6) nextErrors.password = "A senha deve ter no mínimo 6 caracteres.";

    if (role === "paciente") {
      if (!sex.trim()) nextErrors.sex = "Informe o sexo.";
      else if (sex === "Outro") nextErrors.sex = "Escreva sua identificação no campo Outro.";
      if (somenteDigitos(patientPhone).length < 10) nextErrors.patientPhone = "Informe o telefone do paciente.";
      if (somenteDigitos(birthDate).length !== 8) nextErrors.birthDate = "Informe a data de nascimento completa.";
      else if (!dataBrValida(birthDate)) nextErrors.birthDate = "Informe uma data de nascimento válida.";
      else if (!dataBrPassadaOuHoje(birthDate)) nextErrors.birthDate = "A data de nascimento não pode estar no futuro.";
    }

    if (role === "medico" && somenteDigitos(crm).length < 4) {
      nextErrors.crm = "Informe o CRM do médico.";
    }

    if (role === "dono") {
      const cleanCnpj = somenteDigitos(cnpj);
      if (cleanCnpj.length !== 14) nextErrors.cnpj = "Informe os 14 números do CNPJ.";
      else if (cnpjStatus !== "valid" || cnpjValidado !== cleanCnpj) {
        try {
          await consultarCnpj(cleanCnpj);
          setCnpjStatus("valid");
          setCnpjValidado(cleanCnpj);
        } catch (error) {
          nextErrors.cnpj = error.message || "Não foi possível validar o CNPJ.";
          setCnpjStatus("invalid");
        }
      }
      if (!unitName.trim()) nextErrors.unitName = "Informe o nome da unidade.";
      if (somenteDigitos(cep).length !== 8) nextErrors.cep = "Informe e selecione um CEP válido.";
      else if (!(await buscarCep(cep))) nextErrors.cep = "CEP não localizado.";
      if (!address.trim()) nextErrors.address = "Informe o endereço da unidade.";
      if (!number.trim()) nextErrors.number = "Informe o número da unidade.";
      if (somenteDigitos(phone).length < 10) nextErrors.phone = "Informe o telefone da unidade.";

      if (!nextErrors.cep && !nextErrors.address) {
        const coherence = await validarEnderecoCep(cep, address);
        if (!coherence.valid) {
          nextErrors.address = coherence.reason;
        }
      }
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    try {
      await cadastrar({
        role,
        usuarioId: cadastroCpf.existe ? cadastroCpf.usuarioId : undefined,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        cpf,
        password,
        sex: role === "paciente" ? sex.trim() : undefined,
        phone: role === "paciente" ? patientPhone : role === "dono" ? phone : undefined,
        birthDate: role === "paciente" ? dataBrParaIso(birthDate) : undefined,
        crm: role === "medico" ? crm : undefined,
        cnpj: role === "dono" ? cnpj : undefined,
        unitName: role === "dono" ? unitName.trim() : undefined,
        cep: role === "dono" ? cep : undefined,
        address: role === "dono" ? address.trim() : undefined,
        number: role === "dono" ? number.trim() : undefined,
        logoUri: role === "dono" ? logoUri : undefined,
      });
    } catch (error) {
      setErrors((current) => ({ ...current, general: error.message }));
    }
  }

  const papelJaExiste = cadastroCpf.existe && cadastroCpf.papeis.includes(role);
  const cpfError = errors.cpf || (papelJaExiste ? `Este CPF já possui cadastro como ${role}.` : "");

  return (
    <Tela>
      <View className="mx-auto w-full max-w-[720px]">
        <CabecalhoApp
          titulo="Criar cadastro"
          subtitulo="Escolha um dos três perfis e complete somente as informações necessárias."
          aoVoltar={() => navegacao.goBack()}
        />

        <Text className="mb-3 font-semibold text-ink">Selecione seu perfil</Text>
        <View className="mb-6 flex-row flex-wrap gap-3">
          <OpcaoPerfil
            ativo={role === "paciente"}
            icone="person-outline"
            titulo="Paciente"
            subtitulo="Acompanhar diagnósticos"
            aoPressionar={() => selectRole("paciente")}
          />
          <OpcaoPerfil
            ativo={role === "medico"}
            icone="medical-outline"
            titulo="Médico"
            subtitulo="Diagnosticar pacientes"
            aoPressionar={() => selectRole("medico")}
          />
          <OpcaoPerfil
            ativo={role === "dono"}
            icone="business-outline"
            titulo="Unidade"
            subtitulo="Gerenciar médicos"
            aoPressionar={() => selectRole("dono")}
          />
        </View>

        <View className="rounded-3xl border border-mint-100 bg-white p-5 hover:shadow-xl transition-all duration-200">
          <Text className="mb-5 text-lg font-black text-ink">Dados de acesso</Text>

          <CampoApp
            rotulo="Nome completo"
            valor={name}
            aoAlterarTexto={(value) => {
              setName(value);
              setErrors((current) => ({ ...current, name: "" }));
            }}
            placeholder="Seu nome completo"
            erro={errors.name}
          />

          <CampoApp
            rotulo="E-mail"
            valor={email}
            aoAlterarTexto={(value) => {
              setEmail(value);
              setErrors((current) => ({ ...current, email: "" }));
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            inputMode="email"
            placeholder="voce@email.com"
            erro={errors.email}
          />

          <CampoCpf
            rotulo="CPF"
            valor={cpf}
            aoAlterarTexto={alterarCpf}
            erro={cpfError}
            mostrarConfirmacao={cpfStatus === "available"}
            aviso={cadastroCpf.existe && !papelJaExiste}
          />

          {cpfStatus === "checking" ? (
            <Text className="-mt-2 mb-4 text-xs text-slate-400">Verificando CPF...</Text>
          ) : null}

          {cpfStatus === "available" ? (
            <Text className="-mt-2 mb-4 text-xs font-semibold text-mint-700">✓ CPF disponível para cadastro.</Text>
          ) : null}

          {cadastroCpf.existe && !papelJaExiste ? (
            <Text className="-mt-2 mb-4 text-xs font-semibold text-amber-700">
              ⚠ Este CPF já possui cadastro como {cadastroCpf.papeis.length ? cadastroCpf.papeis.join(", ") : "outro tipo"}. Você pode acrescentar {role}, mas não repetir um papel existente.
            </Text>
          ) : null}

          {role === "paciente" ? (
            <>
              <SeletorSexo
                valor={sex}
                aoAlterar={(value) => { setSex(value); setErrors((current) => ({ ...current, sex: "" })); }}
                erro={errors.sex}
              />
              <CampoApp
                rotulo="Telefone"
                valor={patientPhone}
                aoAlterarTexto={(value) => { setPatientPhone(mascararTelefone(value)); setErrors((current) => ({ ...current, patientPhone: "" })); }}
                keyboardType="phone-pad"
                inputMode="tel"
                maxLength={15}
                placeholder="(00) 00000-0000"
                erro={errors.patientPhone}
              />
              <CampoSelecaoData
                rotulo="Data de nascimento"
                valor={birthDate}
                aoAlterar={(value) => { setBirthDate(value); setErrors((current) => ({ ...current, birthDate: "" })); }}
                anoMaximo={new Date().getFullYear()}
                dataMaxima={new Date()}
                erro={errors.birthDate}
              />
            </>
          ) : null}

          {role === "medico" ? (
            <View className="mb-2 mt-2 rounded-2xl bg-mint-50 p-4">
              <Text className="mb-4 font-black text-mint-800">Dados médicos</Text>
              <CampoApp
                rotulo="CRM"
                valor={crm}
                aoAlterarTexto={(value) => {
                  setCrm(mascararCrm(value));
                  setErrors((current) => ({ ...current, crm: "" }));
                }}
                keyboardType="numeric"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                erro={errors.crm}
              />
            </View>
          ) : null}

          {role === "dono" ? (
            <View className="mb-2 mt-2 rounded-2xl bg-mint-50 p-4">
              <Text className="mb-4 font-black text-mint-800">Dados da unidade</Text>
              <CampoCnpj
                valor={cnpj}
                aoAlterarTexto={(value) => {
                  setCnpj(value);
                  setCnpjStatus("idle");
                  setCnpjValidado("");
                  setErrors((current) => ({ ...current, cnpj: "" }));
                }}
                status={cnpjStatus}
                erro={errors.cnpj}
              />
              <CampoApp
                rotulo="Nome da unidade"
                valor={unitName}
                aoAlterarTexto={(value) => {
                  setUnitName(value);
                  setErrors((current) => ({ ...current, unitName: "" }));
                }}
                placeholder="Clínica / hospital / consultório"
                erro={errors.unitName}
              />
              <CamposLocalizacaoUnidade
                cep={cep}
                endereco={address}
                numero={number}
                telefone={phone}
                aoAlterarCep={(value) => {
                  setCep(value);
                  setErrors((current) => ({ ...current, cep: "", address: "" }));
                }}
                aoAlterarEndereco={(value) => {
                  setAddress(value);
                  setErrors((current) => ({ ...current, address: "" }));
                }}
                aoAlterarNumero={(value) => {
                  setNumber(somenteDigitos(value).slice(0, 8));
                  setErrors((current) => ({ ...current, number: "" }));
                }}
                aoAlterarTelefone={(value) => {
                  setPhone(value);
                  setErrors((current) => ({ ...current, phone: "" }));
                }}
                aoSelecionarLocalizacao={(item) => {
                  setCep(item.cep);
                  setAddress(item.formattedAddress);
                  setErrors((current) => ({ ...current, cep: "", address: "" }));
                }}
                erroCep={errors.cep}
                erroEndereco={errors.address}
                erroNumero={errors.number}
                erroTelefone={errors.phone}
              />

              <Text className="mb-2 font-semibold text-ink">Logo da unidade</Text>
              <Pressable
                onPress={pickLogo}
                className="mb-4 items-center rounded-2xl border border-dashed border-mint-300 bg-white p-4"
              >
                {logoUri ? <Image source={{ uri: logoUri }} className="mb-2 h-20 w-20 rounded-2xl" resizeMode="contain" /> : null}
                <Text className="font-bold text-mint-700">{logoUri ? "Trocar logo" : "Anexar logo"}</Text>
              </Pressable>
            </View>
          ) : null}

          <CampoApp
            rotulo="Senha"
            valor={password}
            aoAlterarTexto={(value) => {
              setPassword(value);
              setErrors((current) => ({ ...current, password: "" }));
            }}
            secureTextEntry
            placeholder="Mínimo 6 caracteres"
            erro={errors.password}
          />

          {errors.general ? (
            <View className="mb-4 rounded-2xl bg-red-50 p-3">
              <Text className="text-sm font-semibold text-red-600">{errors.general}</Text>
            </View>
          ) : null}

          <BotaoPrimario titulo="Finalizar cadastro" aoPressionar={submit} carregando={carregando} />
        </View>
      </View>
    </Tela>
  );
}
