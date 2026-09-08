import React, { useEffect, useMemo, useState } from "react";
import { Alert, Image, Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Screen from "../../components/Screen";
import AppInput from "../../components/AppInput";
import PrimaryButton from "../../components/PrimaryButton";
import MedicationSelectorModal from "../../components/MedicationSelectorModal";
import CidInlineSearch from "../../components/CidInlineSearch";
import { useAuth } from "../../contexts/AuthContext";
import {
  createDiagnosis,
  createTimeline,
  getDoctorUnits,
  listPatientDiagnoses,
  listTimelines,
  searchPatients,
} from "../../services/diagnosisService";
import { maskCPF, formatDateBr } from "../../utils/masks";

function ResponsiveActionButton({ icon, label, disabled, onPress, compact }) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      accessibilityLabel={label}
      className={`flex-row items-center justify-center rounded-xl px-3 py-2 ${disabled ? "bg-slate-200" : "bg-mint-600"}`}
    >
      <Ionicons name={icon} size={20} color="#FFFFFF" />
      {!compact ? <Text className="ml-2 font-bold text-white">{label}</Text> : null}
    </Pressable>
  );
}

export default function CreateDiagnosisScreen() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const compactActions = width < 640;
  const units = useMemo(() => getDoctorUnits(user.id), [user.id]);

  const [patientModal, setPatientModal] = useState(true);
  const [confirmModal, setConfirmModal] = useState(false);
  const [timelineModal, setTimelineModal] = useState(false);
  const [medModal, setMedModal] = useState(false);
  const [query, setQuery] = useState("");
  const [patientOptions, setPatientOptions] = useState([]);
  const [patient, setPatient] = useState(null);
  const [unitId, setUnitId] = useState(units.length === 1 ? units[0].id : "");
  const [title, setTitle] = useState("");
  const [cid, setCid] = useState("");
  const [cidTitle, setCidTitle] = useState("");
  const [description, setDescription] = useState("");
  const [medications, setMedications] = useState([]);
  const [timelines, setTimelines] = useState([]);
  const [timelineId, setTimelineId] = useState("");
  const [newTimelineName, setNewTimelineName] = useState("");
  const [patientDiagnoses, setPatientDiagnoses] = useState([]);
  const [selectedExisting, setSelectedExisting] = useState([]);
  const [timelineError, setTimelineError] = useState("");

  const unit = units.find((u) => u.id === unitId) || (units.length === 1 ? units[0] : null);

  useEffect(() => {
    if (units.length === 1) setUnitId(units[0].id);
  }, [units]);

  useEffect(() => {
    let active = true;
    if (!patientModal) return undefined;
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      setPatientOptions([]);
      return undefined;
    }
    searchPatients(cleanQuery).then((items) => active && setPatientOptions(items));
    return () => { active = false; };
  }, [query, patientModal]);

  useEffect(() => {
    if (!patient) return;
    Promise.all([listTimelines(patient.id), listPatientDiagnoses(patient.id)]).then(([timelineRows, diagnosisRows]) => {
      setTimelines(timelineRows);
      setPatientDiagnoses(diagnosisRows);
    });
  }, [patient]);

  function choosePatient(item) {
    setPatient(item);
    setQuery("");
    setPatientModal(false);
    setTimelineId("");
  }

  function addMedication(item) {
    setMedications((current) => current.some((m) => m.medicationId === item.id)
      ? current
      : [...current, { medicationId: item.id, name: item.name, dosage: "", frequency: "", duration: "", observation: "" }]);
  }

  function updateMedication(index, field, value) {
    setMedications((current) => current.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  }

  async function saveTimeline() {
    if (!patient) {
      setTimelineError("Selecione um paciente antes de criar a linha do tempo.");
      return;
    }
    if (!newTimelineName.trim()) {
      setTimelineError("Informe o nome da linha do tempo antes de criar.");
      return;
    }
    setTimelineError("");
    const created = await createTimeline({
      patientId: patient.id,
      doctorId: user.id,
      name: newTimelineName.trim(),
      diagnosisIds: selectedExisting,
    });
    setTimelines(await listTimelines(patient.id));
    setTimelineId(created.id);
    setNewTimelineName("");
    setSelectedExisting([]);
    setTimelineError("");
    setTimelineModal(false);
  }

  function requestSave() {
    if (!patient) return setPatientModal(true);
    if (!unitId || !title.trim() || !cid.trim() || !description.trim()) {
      Alert.alert("Diagnóstico", "Preencha unidade, título, CID-11 e descrição.");
      return;
    }
    setConfirmModal(true);
  }

  async function save() {
    await createDiagnosis({
      patientId: patient.id,
      doctorId: user.id,
      unitId,
      timelineId: timelineId || null,
      title: title.trim(),
      cid: cid.trim().toUpperCase(),
      cidTitle,
      description: description.trim(),
      medications,
    });
    setConfirmModal(false);
    Alert.alert("Diagnóstico criado", "O registro foi salvo no mock.");
    setTitle("");
    setCid("");
    setCidTitle("");
    setDescription("");
    setMedications([]);
    setTimelineId("");
    setPatient(null);
    setQuery("");
    setPatientOptions([]);
    setPatientModal(true);
  }

  return (
    <Screen>
      <View className="mx-auto w-full max-w-[1180px]">
        <Text className="mt-2 text-3xl font-black text-ink">Criar diagnóstico</Text>
        <Text className="mt-2 leading-6 text-slate-500">Selecione o paciente por nome ou CPF e registre o atendimento.</Text>

        {patient ? (
          <View className="mt-5 flex-row items-center justify-between rounded-2xl bg-mint-50 p-4">
            <View>
              <Text className="font-bold text-mint-800">Paciente: {patient.name}</Text>
              <Text className="text-sm text-mint-700">CPF {maskCPF(patient.cpf)}</Text>
            </View>
            <Pressable onPress={() => { setQuery(""); setPatientOptions([]); setPatientModal(true); }}>
              <Text className="font-bold text-mint-700">Trocar</Text>
            </Pressable>
          </View>
        ) : null}

        <View className={`mt-5 ${wide ? "flex-row gap-5" : "gap-5"}`}>
          <View className={`${wide ? "flex-[1.15]" : ""} rounded-3xl border border-mint-100 bg-white p-5 hover:shadow-xl transition-all duration-200`}>
            <Text className="mb-4 text-xl font-black text-ink">Documento clínico</Text>

            {units.length > 1 && !unitId ? (
              <View className="mb-5 rounded-2xl border border-mint-100 bg-mint-50 p-4">
                <Text className="font-black text-mint-900">Qual unidade deseja utilizar?</Text>
                <Text className="mb-3 mt-1 text-sm text-mint-700">Escolha a unidade para liberar o documento clínico.</Text>
                <View className="flex-row flex-wrap gap-3">
                  {units.map((u) => (
                    <Pressable
                      key={u.id}
                      onPress={() => setUnitId(u.id)}
                      className="min-w-[180px] flex-1 rounded-2xl border border-mint-300 bg-white px-4 py-4 active:bg-mint-100"
                    >
                      <View className="flex-row items-center gap-3">
                        <Ionicons name="business-outline" size={22} color="#357257" />
                        <Text className="flex-1 font-black text-mint-800">{u.name}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}

            {unit ? (
              <>
                <View className="mb-5 rounded-2xl bg-mint-50 p-4">
                  <View className="flex-row items-center">
                    {unit?.logoUri ? <Image source={{ uri: unit.logoUri }} className="mr-3 h-14 w-14 rounded-xl" /> : (
                      <View className="mr-3 h-14 w-14 items-center justify-center rounded-xl bg-mint-200">
                        <Ionicons name="business" size={26} color="#357257" />
                      </View>
                    )}
                    <View className="flex-1">
                      <Text className="font-black text-mint-900">{unit.name}</Text>
                      <Text className="mt-1 text-sm text-mint-800">{unit.cep ? `CEP ${String(unit.cep).replace(/(\d{5})(\d{3})/, "$1-$2")}` : ""}</Text>
                      <Text className="text-sm text-mint-800">{unit.address || ""}{unit.number ? `, ${unit.number}` : ""}</Text>
                      <Text className="text-sm text-mint-800">{unit.phone || ""}</Text>
                    </View>
                    {units.length > 1 ? (
                      <Pressable onPress={() => setUnitId("")} className="ml-2 rounded-xl border border-mint-300 px-3 py-2">
                        <Text className="text-xs font-bold text-mint-700">Trocar</Text>
                      </Pressable>
                    ) : null}
                  </View>
                  <View className="mt-4 border-t border-mint-200 pt-3">
                    <Text className="font-semibold text-mint-900">Médico: {user.name}</Text>
                    <Text className="text-sm text-mint-800">CRM {user.crm}</Text>
                  </View>
                </View>

                <AppInput label="Título do diagnóstico" value={title} onChangeText={setTitle} placeholder="Ex.: Acompanhamento respiratório" />

                <CidInlineSearch
                  value={cid}
                  title={cidTitle}
                  onSelect={(item) => { setCid(item.code || ""); setCidTitle(item.title || ""); }}
                />

                <AppInput label="Descrição" value={description} onChangeText={setDescription} multiline placeholder="Descreva o diagnóstico e as observações clínicas." />

                <View className="mb-5 rounded-2xl border border-mint-100 bg-white p-4">
              <View className="mb-3 flex-row items-center justify-between gap-3">
                <Text className="flex-1 font-black text-ink">Medicamentos prescritos</Text>
                <ResponsiveActionButton icon="medkit-outline" label="Adicionar medicamento" onPress={() => setMedModal(true)} compact={compactActions} />
              </View>
              {medications.length === 0 ? <Text className="text-sm text-slate-500">Nenhum medicamento adicionado.</Text> : medications.map((m, index) => (
                <View key={`${m.medicationId}-${index}`} className="mb-3 rounded-2xl bg-mint-50 p-4">
                  <View className="mb-3 flex-row justify-between gap-3">
                    <Text className="flex-1 font-black text-ink">{m.name}</Text>
                    <Pressable onPress={() => setMedications((cur) => cur.filter((_, i) => i !== index))}><Ionicons name="trash-outline" size={20} color="#DC2626" /></Pressable>
                  </View>
                  <AppInput label="Dose" value={m.dosage} onChangeText={(v) => updateMedication(index, "dosage", v)} placeholder="Ex.: 10 mg" />
                  <AppInput label="Frequência" value={m.frequency} onChangeText={(v) => updateMedication(index, "frequency", v)} placeholder="Ex.: 1x ao dia" />
                  <AppInput label="Duração" value={m.duration} onChangeText={(v) => updateMedication(index, "duration", v)} placeholder="Ex.: 7 dias" />
                  <AppInput label="Observação" value={m.observation} onChangeText={(v) => updateMedication(index, "observation", v)} placeholder="Ex.: após as refeições" />
                </View>
              ))}
            </View>

                <PrimaryButton title="Finalizar diagnóstico" onPress={requestSave} />
              </>
            ) : null}
          </View>

          <View className={`${wide ? "flex-1" : ""} rounded-3xl border border-mint-100 bg-white p-5 hover:shadow-xl transition-all duration-200`}>
            <View className="mb-4 flex-row items-center justify-between gap-3">
              <View className="flex-1">
                <Text className="text-xl font-black text-ink">Linha do tempo</Text>
                <Text className="mt-1 text-slate-500">Associe o novo diagnóstico a uma linha existente.</Text>
              </View>
              <ResponsiveActionButton icon="git-branch-outline" label="Criar linha do tempo" disabled={!patient} onPress={() => { setTimelineError(""); setTimelineModal(true); }} compact={compactActions} />
            </View>
            <Pressable onPress={() => setTimelineId("")} className={`mb-3 rounded-2xl border p-4 ${timelineId === "" ? "border-mint-500 bg-mint-50" : "border-slate-200"}`}>
              <Text className="font-bold text-ink">Sem linha do tempo</Text>
            </Pressable>
            {timelines.map((t) => (
              <Pressable key={t.id} onPress={() => setTimelineId(t.id)} className={`mb-3 rounded-2xl border p-4 ${timelineId === t.id ? "border-mint-500 bg-mint-50" : "border-slate-200"}`}>
                <Text className="font-bold text-ink">{t.name}</Text>
                <Text className="mt-1 text-sm text-slate-500">{t.diagnoses.length} diagnóstico(s)</Text>
                {t.diagnoses.slice(0, 3).map((d) => <Text key={d.id} className="mt-1 text-xs text-slate-500">• {formatDateBr(d.createdAt)} · {d.title} · {d.doctorName}</Text>)}
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <Modal transparent animationType="fade" visible={patientModal} onRequestClose={() => patient && setPatientModal(false)}>
        <View className="flex-1 items-center justify-center bg-black/30 p-5">
          <View className="w-full max-w-[520px] rounded-3xl bg-white p-6 hover:shadow-xl transition-all duration-200">
            <Text className="text-2xl font-black text-ink">Qual paciente irá consultar?</Text>
            <Text className="mb-5 mt-2 text-slate-500">Digite nome ou CPF. Os pacientes só aparecem depois que você começar a digitar.</Text>
            <AppInput label="Paciente" value={query} onChangeText={setQuery} placeholder="Nome ou CPF" autoCapitalize="words" />
            {query.trim() ? (
              <ScrollView className="max-h-[260px]">
                {patientOptions.length === 0 ? <Text className="py-6 text-center font-semibold text-slate-500">Nenhum usuário cadastrado</Text> : patientOptions.map((item) => (
                  <Pressable key={item.id} onPress={() => choosePatient(item)} className="mb-2 rounded-2xl border border-mint-100 bg-white p-4 hover:shadow-xl transition-all duration-200">
                    <Text className="font-black text-ink">{item.name}</Text>
                    <Text className="mt-1 text-sm text-slate-500">CPF {maskCPF(item.cpf)}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            ) : null}
            {patient ? <Pressable onPress={() => setPatientModal(false)} className="mt-3 items-center"><Text className="font-bold text-slate-500">Cancelar</Text></Pressable> : null}
          </View>
        </View>
      </Modal>

      <Modal transparent animationType="fade" visible={timelineModal} onRequestClose={() => setTimelineModal(false)}>
        <View className="flex-1 items-center justify-center bg-black/40 p-5">
          <View className="max-h-[88%] w-full max-w-[680px] rounded-3xl bg-white p-6 hover:shadow-xl transition-all duration-200">
            <Text className="text-2xl font-black text-ink">Criar linha do tempo</Text>
            <Text className="mb-5 mt-2 text-slate-500">Você pode incluir registros existentes deste paciente, inclusive diagnósticos feitos por outros médicos.</Text>
            <AppInput label="Nome da linha do tempo" value={newTimelineName} onChangeText={(value) => { setNewTimelineName(value); setTimelineError(""); }} placeholder="Ex.: Acompanhamento respiratório" error={timelineError} />
            <Text className="mb-3 font-black text-ink">Diagnósticos existentes</Text>
            <ScrollView className="max-h-[300px]">
              {patientDiagnoses.length === 0 ? <Text className="py-4 text-slate-500">Nenhum diagnóstico disponível.</Text> : patientDiagnoses.map((d) => {
                const selected = selectedExisting.includes(d.id);
                return (
                  <Pressable key={d.id} onPress={() => setSelectedExisting((current) => selected ? current.filter((id) => id !== d.id) : [...current, d.id])} className={`mb-2 rounded-2xl border p-4 ${selected ? "border-mint-500 bg-mint-50" : "border-slate-200"}`}>
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1">
                        <Text className="font-black text-ink">{d.title}</Text>
                        <Text className="mt-1 text-sm text-slate-500">{formatDateBr(d.createdAt)} · {d.cid} · {d.doctorName}</Text>
                      </View>
                      <Ionicons name={selected ? "checkmark-circle" : "ellipse-outline"} size={22} color={selected ? "#3F8F68" : "#94A3B8"} />
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
            <View className="mt-5 gap-3"><PrimaryButton title="Criar e selecionar" onPress={saveTimeline} /><PrimaryButton title="Cancelar" variant="secondary" onPress={() => { setTimelineError(""); setTimelineModal(false); }} /></View>
          </View>
        </View>
      </Modal>

      <Modal transparent animationType="fade" visible={confirmModal} onRequestClose={() => setConfirmModal(false)}>
        <View className="flex-1 items-center justify-center bg-black/40 p-5">
          <View className="w-full max-w-[520px] rounded-3xl bg-white p-6 hover:shadow-xl transition-all duration-200">
            <Text className="text-2xl font-black text-ink">Finalizar diagnóstico?</Text>
            <Text className="mt-2 text-slate-500">Confirme os dados antes de salvar. Depois de finalizado, este fluxo não oferece edição do diagnóstico.</Text>
            <View className="my-5 rounded-2xl bg-mint-50 p-4 hover:shadow-xl transition-all duration-200">
              <Text className="font-black text-ink">{title} · {cid}</Text>
              <Text className="mt-2 text-sm text-slate-600">Paciente: {patient?.name}</Text>
              <Text className="text-sm text-slate-600">Unidade: {unit?.name}</Text>
            </View>
            <View className="gap-3"><PrimaryButton title="Confirmar e salvar" onPress={save} /><PrimaryButton title="Revisar" variant="secondary" onPress={() => setConfirmModal(false)} /></View>
          </View>
        </View>
      </Modal>

      <MedicationSelectorModal visible={medModal} onClose={() => setMedModal(false)} onSelect={addMedication} />
    </Screen>
  );
}
