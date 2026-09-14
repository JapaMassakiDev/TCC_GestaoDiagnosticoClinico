import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

const ALTURA_ITEM = 44;

const toBr = (date) => `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;

const brToDate = (value) => {
  const match = String(value || "").match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day, 12, 0, 0);

  if (
    Number.isNaN(date.getTime())
    || date.getFullYear() !== year
    || date.getMonth() !== month - 1
    || date.getDate() !== day
  ) return null;

  return date;
};

const diasNoMes = (month, year) => new Date(year, month, 0).getDate();

function ColunaWheel({ rotulo, opcoes, valor, aoAlterar }) {
  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const indiceSelecionado = Math.max(0, opcoes.findIndex((option) => option.valor === valor));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTo({ top: indiceSelecionado * ALTURA_ITEM, behavior: "smooth" });
  }, [indiceSelecionado]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const selecionarPeloScroll = (event) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const scrollTop = event.currentTarget.scrollTop;
    timerRef.current = setTimeout(() => {
      const index = Math.max(0, Math.min(opcoes.length - 1, Math.round(scrollTop / ALTURA_ITEM)));
      aoAlterar(opcoes[index].valor);
    }, 80);
  };

  return (
    <div style={{ flex: 1, minWidth: 78 }}>
      <div style={{ marginBottom: 8, textAlign: "center", color: "#64748B", fontSize: 13, fontWeight: 700 }}>
        {rotulo}
      </div>
      <div style={{ position: "relative", height: 220 }}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            zIndex: 1,
            top: 88,
            right: 0,
            left: 0,
            height: ALTURA_ITEM,
            borderTop: "1px solid #A7DCC0",
            borderBottom: "1px solid #A7DCC0",
            background: "rgba(234, 248, 240, 0.72)",
            pointerEvents: "none",
          }}
        />
        <div
          ref={containerRef}
          role="listbox"
          aria-label={rotulo}
          onScroll={selecionarPeloScroll}
          style={{
            height: 220,
            overflowY: "auto",
            padding: "88px 0",
            boxSizing: "border-box",
            scrollSnapType: "y mandatory",
            scrollbarWidth: "none",
            overscrollBehavior: "contain",
          }}
        >
          {opcoes.map((option) => {
            const selecionada = option.valor === valor;
            return (
              <button
                key={option.valor}
                type="button"
                role="option"
                aria-selected={selecionada}
                onClick={() => aoAlterar(option.valor)}
                style={{
                  display: "block",
                  width: "100%",
                  height: ALTURA_ITEM,
                  border: 0,
                  padding: 0,
                  scrollSnapAlign: "center",
                  background: "transparent",
                  color: selecionada ? "#26352F" : "#94A3B8",
                  fontSize: selecionada ? 17 : 15,
                  fontWeight: selecionada ? 700 : 500,
                  cursor: "pointer",
                }}
              >
                {option.rotulo}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SeletorWheelWeb({ dataInicial, dataMinima, dataMaxima, aoCancelar, aoConfirmar }) {
  const [dia, setDia] = useState(dataInicial.getDate());
  const [mes, setMes] = useState(dataInicial.getMonth() + 1);
  const [ano, setAno] = useState(dataInicial.getFullYear());

  const anos = useMemo(() => Array.from(
    { length: dataMaxima.getFullYear() - dataMinima.getFullYear() + 1 },
    (_, index) => dataMinima.getFullYear() + index,
  ), [dataMaxima, dataMinima]);
  const totalDias = diasNoMes(mes, ano);

  useEffect(() => {
    if (dia > totalDias) setDia(totalDias);
  }, [dia, totalDias]);

  const confirmar = () => {
    const date = new Date(ano, mes - 1, Math.min(dia, totalDias), 12, 0, 0);
    if (date < dataMinima) {
      aoConfirmar(dataMinima);
      return;
    }
    if (date > dataMaxima) {
      aoConfirmar(dataMaxima);
      return;
    }
    aoConfirmar(date);
  };

  return (
    <Modal transparent animationType="fade" visible onRequestClose={aoCancelar}>
      <View
        accessibilityViewIsModal
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          backgroundColor: "rgba(0, 0, 0, 0.30)",
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 520,
            maxHeight: "90%",
            borderWidth: 1,
            borderColor: "#E7F3EC",
            borderRadius: 24,
            padding: 24,
            backgroundColor: "#FFFFFF",
            boxShadow: "0 22px 55px rgba(38, 53, 47, 0.22)",
          }}
        >
          <Text className="mb-[18px] text-2xl font-black text-ink">Selecionar data</Text>
        <div style={{ display: "flex", gap: 12, overflow: "hidden", borderRadius: 20, background: "#FBFDFC", padding: "8px 10px" }}>
          <ColunaWheel
            rotulo="Dia"
            valor={dia}
            opcoes={Array.from({ length: totalDias }, (_, index) => ({ valor: index + 1, rotulo: String(index + 1).padStart(2, "0") }))}
            aoAlterar={setDia}
          />
          <ColunaWheel
            rotulo="Mês"
            valor={mes}
            opcoes={Array.from({ length: 12 }, (_, index) => ({ valor: index + 1, rotulo: String(index + 1).padStart(2, "0") }))}
            aoAlterar={setMes}
          />
          <ColunaWheel
            rotulo="Ano"
            valor={ano}
            opcoes={anos.map((item) => ({ valor: item, rotulo: String(item) }))}
            aoAlterar={setAno}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 22 }}>
          <button type="button" onClick={aoCancelar} style={estiloBotaoWeb("#F1FAF5", "#357257", "#A7DCC0")}>Cancelar</button>
          <button type="button" onClick={confirmar} style={estiloBotaoWeb("#357257", "#FFFFFF", "#357257")}>Salvar</button>
        </div>
        </View>
      </View>
    </Modal>
  );
}

const estiloBotaoWeb = (background, color, borderColor) => ({
  minHeight: 50,
  border: `1px solid ${borderColor}`,
  borderRadius: 16,
  padding: "0 16px",
  background,
  color,
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
});

export default function CampoSelecaoData({
  rotulo: label,
  valor: value = "",
  aoAlterar: onChange,
  erro: error,
  anoMinimo: minYear = 1900,
  anoMaximo: maxYear = new Date().getFullYear(),
  dataMaxima: maximumDate = null,
}) {
  const [showPicker, setShowPicker] = useState(false);
  const minDate = useMemo(() => new Date(minYear, 0, 1, 12, 0, 0), [minYear]);
  const maxDate = useMemo(() => maximumDate || new Date(maxYear, 11, 31, 12, 0, 0), [maximumDate, maxYear]);
  const selectedDate = brToDate(value) || maxDate;
  const [nativeDraftDate, setNativeDraftDate] = useState(selectedDate);

  const abrirSeletor = () => {
    setNativeDraftDate(selectedDate);
    setShowPicker(true);
  };

  if (Platform.OS === "web") {
    return (
      <View className="mb-4">
        {label ? <Text className="mb-2 font-semibold text-ink">{label}</Text> : null}
        <button
          type="button"
          onClick={abrirSeletor}
          aria-label={`${label || "Data"}: ${value || "não selecionada"}. Abrir seletor em formato wheel.`}
          style={{
            display: "flex",
            width: "100%",
            minHeight: 50,
            alignItems: "center",
            justifyContent: "center",
            border: `1px dashed ${error ? "#FCA5A5" : "#A7DCC0"}`,
            borderRadius: 16,
            padding: "0 16px",
            background: "#FFFFFF",
            color: "#357257",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Ionicons name="calendar-outline" size={21} color="#357257" />
            <span>{value || "Selecionar data"}</span>
          </span>
        </button>
        {showPicker ? (
          <SeletorWheelWeb
            dataInicial={selectedDate}
            dataMinima={minDate}
            dataMaxima={maxDate}
            aoCancelar={() => setShowPicker(false)}
            aoConfirmar={(date) => {
              onChange(toBr(date));
              setShowPicker(false);
            }}
          />
        ) : null}
        {error ? <Text className="mt-1 text-sm text-red-500">{error}</Text> : null}
      </View>
    );
  }

  return (
    <View className="mb-4">
      {label ? <Text className="mb-2 font-semibold text-ink">{label}</Text> : null}
      <Pressable
        onPress={abrirSeletor}
        accessibilityLabel={`${label || "Data"}: ${value || "não selecionada"}. Abrir seletor em formato wheel.`}
        className={`min-h-[50px] flex-row items-center justify-center gap-2 rounded-2xl border border-dashed bg-white px-4 ${error ? "border-red-300" : "border-mint-300"}`}
      >
        <Ionicons name="calendar-outline" size={21} color="#357257" />
        <Text className="font-bold text-mint-700">{value || "Selecionar data"}</Text>
      </Pressable>
      {Platform.OS === "android" && showPicker ? (
        <DateTimePicker
          value={nativeDraftDate}
          mode="date"
          display="spinner"
          minimumDate={minDate}
          maximumDate={maxDate}
          positiveButton={{ label: "Salvar", textColor: "#357257" }}
          negativeButton={{ label: "Cancelar", textColor: "#64748B" }}
          onChange={(event, date) => {
            setShowPicker(false);
            if (event.type === "dismissed" || !date) return;
            onChange(toBr(date));
          }}
        />
      ) : null}
      {Platform.OS === "ios" ? (
        <Modal transparent animationType="fade" visible={showPicker} onRequestClose={() => setShowPicker(false)}>
          <View className="flex-1 items-center justify-center bg-black/30 p-5">
            <View className="w-full max-w-[520px] rounded-3xl border border-mint-100 bg-white p-6 shadow-xl">
              <Text className="text-2xl font-black text-ink">Selecionar data</Text>
              <View className="my-5 overflow-hidden rounded-2xl bg-slate-50 p-2">
                <DateTimePicker
                  value={nativeDraftDate}
                  mode="date"
                  display="spinner"
                  minimumDate={minDate}
                  maximumDate={maxDate}
                  onChange={(event, date) => {
                    if (event.type !== "dismissed" && date) setNativeDraftDate(date);
                  }}
                />
              </View>
              <View className="flex-row gap-3">
                <Pressable onPress={() => setShowPicker(false)} className="flex-1 items-center justify-center rounded-2xl border border-mint-300 bg-mint-50 px-5 py-4">
                  <Text className="font-bold text-mint-800">Cancelar</Text>
                </Pressable>
                <Pressable onPress={() => { onChange(toBr(nativeDraftDate)); setShowPicker(false); }} className="flex-1 items-center justify-center rounded-2xl bg-mint-600 px-5 py-4">
                  <Text className="font-bold text-white">Salvar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
      {error ? <Text className="mt-1 text-sm text-red-500">{error}</Text> : null}
    </View>
  );
}
