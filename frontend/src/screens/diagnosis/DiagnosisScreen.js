import React, { useCallback, useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import Screen from "../../components/Screen";
import PrimaryButton from "../../components/PrimaryButton";
import DateSelectField from "../../components/DateSelectField";
import { useAuth } from "../../contexts/AuthContext";
import { listDiagnoses, listTimelines } from "../../services/diagnosisService";
import { diagnosisHtml, generatePdf, printHtml, timelineHtml } from "../../services/printService";
import { formatDateBr } from "../../utils/masks";

const EMPTY_RECORD_FILTERS = { date: "", name: "", cid: "", timeline: "", doctor: "" };
const EMPTY_TIMELINE_FILTERS = { date: "", name: "", diagnosis: "", cid: "", doctor: "" };

function FilterButton({ open, onPress, activeCount = 0 }) {
  const { width } = useWindowDimensions();
  const compact = width < 640;

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-2 rounded-xl border px-3 py-2 ${open || activeCount ? "border-mint-400 bg-mint-100" : "border-mint-200 bg-white"}`}
      accessibilityLabel={open ? "Fechar filtros" : "Abrir filtros"}
    >
      <Ionicons name="filter-outline" size={18} color="#357257" />
      {!compact ? <Text className="font-bold text-mint-800">Filtrar{activeCount ? ` (${activeCount})` : ""}</Text> : null}
    </Pressable>
  );
}

function InlineInput(props) {
  return (
    <TextInput
      placeholderTextColor="#7D8D86"
      className="min-w-[160px] flex-1 rounded-2xl border border-mint-200 bg-white px-4 py-3 text-ink hover:shadow-xl transition-all duration-200"
      {...props}
    />
  );
}

export default function DiagnosisScreen() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [timelines, setTimelines] = useState([]);
  const [recordFilters, setRecordFilters] = useState(EMPTY_RECORD_FILTERS);
  const [timelineFilters, setTimelineFilters] = useState(EMPTY_TIMELINE_FILTERS);
  const [showRecordFilters, setShowRecordFilters] = useState(false);
  const [showTimelineFilters, setShowTimelineFilters] = useState(false);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
  const [selectedTimeline, setSelectedTimeline] = useState(null);

  const load = useCallback(async () => {
    const diagnoses = await listDiagnoses(user);
    setRows(diagnoses);
    const patientIds = [...new Set(diagnoses.map((d) => d.patientId))];
    const groups = await Promise.all(patientIds.map((id) => listTimelines(id)));
    setTimelines(groups.flat());
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filteredRows = useMemo(() => rows.filter((row) => {
    const date = formatDateBr(row.createdAt);
    return (!recordFilters.date || date === recordFilters.date)
      && (!recordFilters.name || row.patientName.toLowerCase().includes(recordFilters.name.toLowerCase()))
      && (!recordFilters.cid || row.cid.toLowerCase().includes(recordFilters.cid.toLowerCase()))
      && (!recordFilters.timeline || (row.timelineName || "").toLowerCase().includes(recordFilters.timeline.toLowerCase()))
      && (!recordFilters.doctor || row.doctorName.toLowerCase().includes(recordFilters.doctor.toLowerCase()));
  }), [rows, recordFilters]);

  const filteredTimelines = useMemo(() => timelines.filter((timeline) => {
    const diagnoses = timeline.diagnoses || [];
    return (!timelineFilters.name || timeline.name.toLowerCase().includes(timelineFilters.name.toLowerCase()))
      && (!timelineFilters.date || diagnoses.some((d) => formatDateBr(d.createdAt) === timelineFilters.date))
      && (!timelineFilters.diagnosis || diagnoses.some((d) => d.title.toLowerCase().includes(timelineFilters.diagnosis.toLowerCase())))
      && (!timelineFilters.cid || diagnoses.some((d) => d.cid.toLowerCase().includes(timelineFilters.cid.toLowerCase())))
      && (!timelineFilters.doctor || diagnoses.some((d) => d.doctorName.toLowerCase().includes(timelineFilters.doctor.toLowerCase())));
  }), [timelines, timelineFilters]);

  const recordFilterCount = Object.values(recordFilters).filter(Boolean).length;
  const timelineFilterCount = Object.values(timelineFilters).filter(Boolean).length;

  async function doPrint(html) {
    try { await printHtml(html); } catch (e) { Alert.alert("Impressão", e.message); }
  }

  async function doPdf(html) {
    try { await generatePdf(html); } catch (e) { Alert.alert("PDF", e.message); }
  }

  return (
    <Screen>
      <View className="mx-auto w-full max-w-[1180px]">
        <Text className="mt-2 text-3xl font-black text-ink">Diagnósticos</Text>
        <Text className="mt-2 text-slate-500">Selecione um diagnóstico ou uma linha do tempo para visualizar, imprimir ou gerar PDF.</Text>

        <View className="mt-5 rounded-3xl border border-mint-100 bg-white p-5 hover:shadow-xl transition-all duration-200">
          <View className="mb-4 flex-row items-center justify-between gap-3">
            <Text className="text-xl font-black text-ink">Registros</Text>
            <FilterButton open={showRecordFilters} activeCount={recordFilterCount} onPress={() => setShowRecordFilters((v) => !v)} />
          </View>

          {showRecordFilters ? (
            <View className="mb-5 rounded-2xl bg-mint-50 p-4 hover:shadow-xl transition-all duration-200">
              <Text className="mb-3 font-black text-mint-800">Filtrar registros</Text>
              <DateSelectField
                label="Data do diagnóstico"
                value={recordFilters.date}
                onChange={(date) => setRecordFilters((f) => ({ ...f, date }))}
                minYear={2000}
                maxYear={new Date().getFullYear()}
                maximumDate={new Date()}
              />
              <View className="flex-row flex-wrap gap-3">
                <InlineInput value={recordFilters.name} onChangeText={(name) => setRecordFilters((f) => ({ ...f, name }))} placeholder="Paciente" autoCapitalize="words" />
                <InlineInput value={recordFilters.cid} onChangeText={(cid) => setRecordFilters((f) => ({ ...f, cid: cid.toUpperCase() }))} placeholder="CID-11" autoCapitalize="characters" />
                <InlineInput value={recordFilters.timeline} onChangeText={(timeline) => setRecordFilters((f) => ({ ...f, timeline }))} placeholder="Linha do tempo" />
                <InlineInput value={recordFilters.doctor} onChangeText={(doctor) => setRecordFilters((f) => ({ ...f, doctor }))} placeholder="Médico" autoCapitalize="words" />
              </View>
              {recordFilterCount ? (
                <Pressable onPress={() => setRecordFilters(EMPTY_RECORD_FILTERS)} className="mt-3 self-start">
                  <Text className="font-bold text-mint-700">Limpar filtros</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          <ScrollView horizontal>
            <View className="min-w-[950px]">
              <View className="flex-row rounded-xl bg-mint-50 px-3 py-3">
                {["Data", "Paciente", "CID", "Diagnóstico", "Linha do tempo", "Médico"].map((h) => <Text key={h} className="w-[158px] font-black text-mint-800">{h}</Text>)}
              </View>
              {filteredRows.length === 0 ? (
                <Text className="py-8 text-center text-slate-500">Nenhum diagnóstico encontrado.</Text>
              ) : filteredRows.map((r) => (
                <Pressable key={r.id} onPress={() => setSelectedDiagnosis(r)} className="flex-row border-b border-slate-100 px-3 py-4">
                  {[formatDateBr(r.createdAt), r.patientName, r.cid, r.title, r.timelineName || "—", r.doctorName].map((v, i) => <Text key={i} numberOfLines={2} className="w-[158px] pr-3 text-sm text-ink">{v}</Text>)}
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className="mt-5 rounded-3xl border border-mint-100 bg-white p-5 hover:shadow-xl transition-all duration-200">
          <View className="flex-row items-center justify-between gap-3">
            <View className="flex-1">
              <Text className="text-xl font-black text-ink">Linhas do tempo</Text>
              <Text className="mt-1 text-slate-500">Visualização somente nesta aba. A criação fica exclusivamente na aba Criar do médico.</Text>
            </View>
            <FilterButton open={showTimelineFilters} activeCount={timelineFilterCount} onPress={() => setShowTimelineFilters((v) => !v)} />
          </View>

          {showTimelineFilters ? (
            <View className="my-5 rounded-2xl bg-mint-50 p-4 hover:shadow-xl transition-all duration-200">
              <Text className="mb-3 font-black text-mint-800">Filtrar linhas do tempo</Text>
              <DateSelectField
                label="Data de algum diagnóstico"
                value={timelineFilters.date}
                onChange={(date) => setTimelineFilters((f) => ({ ...f, date }))}
                minYear={2000}
                maxYear={new Date().getFullYear()}
                maximumDate={new Date()}
              />
              <View className="flex-row flex-wrap gap-3">
                <InlineInput value={timelineFilters.name} onChangeText={(name) => setTimelineFilters((f) => ({ ...f, name }))} placeholder="Nome da linha do tempo" />
                <InlineInput value={timelineFilters.diagnosis} onChangeText={(diagnosis) => setTimelineFilters((f) => ({ ...f, diagnosis }))} placeholder="Diagnóstico" />
                <InlineInput value={timelineFilters.cid} onChangeText={(cid) => setTimelineFilters((f) => ({ ...f, cid: cid.toUpperCase() }))} placeholder="CID-11" autoCapitalize="characters" />
                <InlineInput value={timelineFilters.doctor} onChangeText={(doctor) => setTimelineFilters((f) => ({ ...f, doctor }))} placeholder="Médico" autoCapitalize="words" />
              </View>
              {timelineFilterCount ? (
                <Pressable onPress={() => setTimelineFilters(EMPTY_TIMELINE_FILTERS)} className="mt-3 self-start">
                  <Text className="font-bold text-mint-700">Limpar filtros</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          <View className="mt-4">
            {filteredTimelines.length === 0 ? (
              <Text className="py-6 text-slate-500">Nenhuma linha do tempo encontrada.</Text>
            ) : filteredTimelines.map((t) => (
              <Pressable key={t.id} onPress={() => setSelectedTimeline(t)} className="mb-3 rounded-2xl border border-mint-100 bg-white p-4 hover:shadow-xl transition-all duration-200">
                <View className="flex-row justify-between gap-3">
                  <View className="flex-1">
                    <Text className="font-black text-ink">{t.name}</Text>
                    <Text className="mt-1 text-sm text-slate-500">{t.diagnoses.length} diagnóstico(s)</Text>
                  </View>
                  <Text className="font-bold text-mint-700">Abrir ›</Text>
                </View>
                {t.diagnoses.slice(0, 3).map((d) => <Text key={d.id} className="mt-2 text-sm text-slate-500">• {formatDateBr(d.createdAt)} · {d.title} · {d.doctorName}</Text>)}
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <Modal visible={!!selectedDiagnosis} transparent animationType="fade" onRequestClose={() => setSelectedDiagnosis(null)}>
        <View className="flex-1 items-center justify-center bg-black/40 p-5">
          <ScrollView className="max-h-[90%] w-full max-w-[760px] rounded-3xl bg-white hover:shadow-xl transition-all duration-200">
            <View className="p-6">
              <Text className="text-2xl font-black text-ink">{selectedDiagnosis?.title}</Text>
              <Text className="mt-1 font-bold text-mint-700">CID {selectedDiagnosis?.cid}</Text>
              <Text className="mt-4 text-slate-600">Paciente: {selectedDiagnosis?.patientName}</Text>
              <Text className="text-slate-600">Médico: {selectedDiagnosis?.doctorName} · CRM {selectedDiagnosis?.doctorCrm}</Text>
              <Text className="text-slate-600">Unidade: {selectedDiagnosis?.unitName}</Text>
              <Text className="text-slate-600">Data: {selectedDiagnosis ? formatDateBr(selectedDiagnosis.createdAt) : ""}</Text>
              <Text className="mt-5 font-black text-ink">Descrição</Text>
              <Text className="mt-2 leading-6 text-slate-600">{selectedDiagnosis?.description}</Text>
              <Text className="mt-5 font-black text-ink">Medicamentos</Text>
              {(selectedDiagnosis?.medications || []).length === 0 ? <Text className="mt-2 text-slate-500">Nenhum medicamento prescrito.</Text> : (selectedDiagnosis?.medications || []).map((m, i) => (
                <View key={i} className="mt-2 rounded-2xl bg-mint-50 p-3">
                  <Text className="font-bold text-ink">{typeof m === "string" ? m : m.name}</Text>
                  {typeof m === "object" ? <Text className="mt-1 text-xs text-slate-500">Dose: {m.dosage || "-"} · Frequência: {m.frequency || "-"} · Duração: {m.duration || "-"}{m.observation ? ` · ${m.observation}` : ""}</Text> : null}
                </View>
              ))}
              <View className="mt-6 gap-3">
                <PrimaryButton title="Imprimir" icon="print-outline" variant="print" onPress={() => doPrint(diagnosisHtml(selectedDiagnosis))} />
                <PrimaryButton title="Gerar PDF" icon="document-text-outline" variant="pdf" onPress={() => generatePdf(diagnosisHtml(selectedDiagnosis), `diagnostico-${selectedDiagnosis?.id || "registro"}.pdf`).catch((e) => Alert.alert("PDF", e.message))} />
                <PrimaryButton title="Fechar" variant="secondary" onPress={() => setSelectedDiagnosis(null)} />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={!!selectedTimeline} transparent animationType="fade" onRequestClose={() => setSelectedTimeline(null)}>
        <View className="flex-1 items-center justify-center bg-black/40 p-5">
          <ScrollView className="max-h-[90%] w-full max-w-[760px] rounded-3xl bg-white hover:shadow-xl transition-all duration-200">
            <View className="p-6">
              <Text className="text-2xl font-black text-ink">{selectedTimeline?.name}</Text>
              <Text className="mb-5 mt-1 text-slate-500">Linha do tempo clínica</Text>
              {(selectedTimeline?.diagnoses || []).map((d) => (
                <Pressable
                  key={d.id}
                  onPress={() => { setSelectedTimeline(null); setSelectedDiagnosis(d); }}
                  accessibilityLabel={`Abrir diagnóstico ${d.title}`}
                  className="mb-4 rounded-2xl border border-mint-100 border-l-4 border-l-mint-400 bg-white p-4 hover:shadow-xl transition-all duration-200"
                >
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="font-black text-ink">{formatDateBr(d.createdAt)} · {d.title}</Text>
                      <Text className="mt-1 text-sm text-mint-700">CID {d.cid}</Text>
                      <Text className="mt-1 text-sm text-slate-500">{d.doctorName} · {d.unitName}</Text>
                      <Text className="mt-2 text-slate-600">{d.description}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Text className="text-sm font-bold text-mint-700">Abrir</Text>
                      <Ionicons name="chevron-forward" size={18} color="#357257" />
                    </View>
                  </View>
                </Pressable>
              ))}
              <View className="mt-4 gap-3">
                <PrimaryButton title="Imprimir linha do tempo" icon="print-outline" variant="print" onPress={() => doPrint(timelineHtml(selectedTimeline))} />
                <PrimaryButton title="Gerar PDF" icon="document-text-outline" variant="pdf" onPress={() => generatePdf(timelineHtml(selectedTimeline), `linha-do-tempo-${selectedTimeline?.id || "historico"}.pdf`).catch((e) => Alert.alert("PDF", e.message))} />
                <PrimaryButton title="Fechar" variant="secondary" onPress={() => setSelectedTimeline(null)} />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </Screen>
  );
}
