import React, { useEffect, useMemo, useRef, useState } from "react";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

const onlyDigits = (value = "") => String(value).replace(/\D/g, "");

const maskDate = (value = "") => onlyDigits(value)
  .slice(0, 8)
  .replace(/^(\d{2})(\d)/, "$1/$2")
  .replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");

const toIso = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const isoToBr = (iso) => {
  if (!iso) return "";
  const [y, m, d] = String(iso).split("-");
  return y && m && d ? `${d}/${m}/${y}` : "";
};

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

export default function DateSelectField({
  label,
  value = "",
  onChange,
  error,
  minYear = 1900,
  maxYear = new Date().getFullYear(),
  maximumDate = null,
  pickerOnly = false,
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [manualValue, setManualValue] = useState(value);
  const [manualError, setManualError] = useState("");
  const webCalendarRef = useRef(null);
  const minDate = useMemo(() => new Date(minYear, 0, 1, 12, 0, 0), [minYear]);
  const maxDate = useMemo(() => maximumDate || new Date(maxYear, 11, 31, 12, 0, 0), [maximumDate, maxYear]);
  const selectedDate = brToDate(value) || maxDate;

  useEffect(() => {
    setManualValue(value || "");
    if (!value) setManualError("");
  }, [value]);

  if (Platform.OS === "web") {
    // Nos filtros (pickerOnly), usamos um campo DD/MM/AAAA controlado + um
    // input date invisível apenas para o calendário. Isso evita o bug dos
    // segmentos do <input type="date"> que podia transformar a digitação do
    // ano em 190x, mas mantém as duas formas de entrada: teclado e calendário.
    if (pickerOnly) {
      const currentDate = brToDate(value);
      const calendarValue = currentDate ? toIso(currentDate) : "";
      const visibleError = error || manualError;

      const handleManualChange = (event) => {
        const next = maskDate(event.target.value);
        setManualValue(next);
        setManualError("");

        if (!next) {
          onChange("");
          return;
        }

        // Enquanto a pessoa digita, o texto permanece no campo, mas o filtro
        // só recebe a data quando ela estiver completa e coerente.
        if (onlyDigits(next).length < 8) {
          onChange("");
          return;
        }

        const parsed = brToDate(next);
        if (!parsed || parsed < minDate || parsed > maxDate) {
          setManualError("Data inválida ou fora do período permitido.");
          onChange("");
          return;
        }

        onChange(next);
      };

      const openCalendar = () => {
        const input = webCalendarRef.current;
        if (!input) return;
        if (typeof input.showPicker === "function") input.showPicker();
        else input.click();
      };

      return (
        <View className="mb-4">
          {label ? <Text className="mb-2 font-semibold text-ink">{label}</Text> : null}
          <div style={{ position: "relative", width: "100%" }}>
            <input
              type="text"
              value={manualValue}
              placeholder="DD/MM/AAAA"
              inputMode="numeric"
              maxLength={10}
              onChange={handleManualChange}
              aria-label={label || "Data"}
              style={{
                width: "100%",
                minHeight: 50,
                borderRadius: 16,
                border: `1px solid ${visibleError ? "#FCA5A5" : "#C8EBD8"}`,
                padding: "0 52px 0 14px",
                fontSize: 16,
                color: "#26352F",
                background: "white",
                outlineColor: "#78C8A0",
                boxSizing: "border-box",
              }}
            />
            <button
              type="button"
              onClick={openCalendar}
              aria-label={`Abrir calendário para ${label || "data"}`}
              title="Selecionar no calendário"
              style={{
                position: "absolute",
                right: 6,
                top: 6,
                width: 38,
                height: 38,
                border: 0,
                borderRadius: 12,
                background: "#EAF8F0",
                color: "#357257",
                fontSize: 20,
                lineHeight: "38px",
                cursor: "pointer",
              }}
            >
              📅
            </button>
            <input
              ref={webCalendarRef}
              type="date"
              value={calendarValue}
              min={toIso(minDate)}
              max={toIso(maxDate)}
              onChange={(event) => {
                const next = isoToBr(event.target.value);
                setManualValue(next);
                setManualError("");
                onChange(next);
              }}
              tabIndex={-1}
              aria-hidden="true"
              style={{
                position: "absolute",
                width: 1,
                height: 1,
                opacity: 0,
                pointerEvents: "none",
                right: 0,
                bottom: 0,
              }}
            />
          </div>
          {visibleError ? <Text className="mt-1 text-sm text-red-500">{visibleError}</Text> : null}
        </View>
      );
    }

    const parsedValue = brToDate(value);
    const webValue = parsedValue ? toIso(parsedValue) : "";
    return (
      <View className="mb-4">
        {label ? <Text className="mb-2 font-semibold text-ink">{label}</Text> : null}
        <input
          type="date"
          value={webValue}
          min={toIso(minDate)}
          max={toIso(maxDate)}
          onChange={(event) => onChange(isoToBr(event.target.value))}
          aria-label={label || "Data"}
          style={{
            width: "100%",
            minHeight: 50,
            borderRadius: 16,
            border: `1px solid ${error ? "#FCA5A5" : "#C8EBD8"}`,
            padding: "0 14px",
            fontSize: 16,
            color: "#26352F",
            background: "white",
            outlineColor: "#78C8A0",
            boxSizing: "border-box",
          }}
        />
        {error ? <Text className="mt-1 text-sm text-red-500">{error}</Text> : null}
      </View>
    );
  }

  if (pickerOnly) {
    const visibleError = error || manualError;

    const handleNativeManualChange = (text) => {
      const next = maskDate(text);
      setManualValue(next);
      setManualError("");

      if (!next) {
        onChange("");
        return;
      }

      if (onlyDigits(next).length < 8) {
        onChange("");
        return;
      }

      const parsed = brToDate(next);
      if (!parsed || parsed < minDate || parsed > maxDate) {
        setManualError("Data inválida ou fora do período permitido.");
        onChange("");
        return;
      }

      onChange(next);
    };

    return (
      <View className="mb-4">
        {label ? <Text className="mb-2 font-semibold text-ink">{label}</Text> : null}
        <View className={`flex-row items-center rounded-2xl border bg-white ${visibleError ? "border-red-300" : "border-mint-200"}`}>
          <TextInput
            value={manualValue}
            onChangeText={handleNativeManualChange}
            placeholder="DD/MM/AAAA"
            keyboardType="number-pad"
            maxLength={10}
            className="min-h-[50px] flex-1 px-4 text-base text-ink"
          />
          <Pressable
            onPress={() => setShowPicker(true)}
            accessibilityLabel={`Abrir calendário para ${label || "data"}`}
            className="mr-2 h-10 w-10 items-center justify-center rounded-xl bg-mint-50"
          >
            <Ionicons name="calendar-outline" size={20} color="#357257" />
          </Pressable>
        </View>
        {showPicker ? (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minimumDate={minDate}
            maximumDate={maxDate}
            onChange={(event, date) => {
              if (Platform.OS === "android") setShowPicker(false);
              if (event.type === "dismissed" || !date) return;
              const next = `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
              setManualValue(next);
              setManualError("");
              onChange(next);
            }}
          />
        ) : null}
        {Platform.OS === "ios" && showPicker ? (
          <Pressable onPress={() => setShowPicker(false)} className="mt-2 self-end rounded-xl bg-mint-100 px-4 py-2">
            <Text className="font-bold text-mint-800">Concluir</Text>
          </Pressable>
        ) : null}
        {visibleError ? <Text className="mt-1 text-sm text-red-500">{visibleError}</Text> : null}
      </View>
    );
  }

  return (
    <View className="mb-4">
      {label ? <Text className="mb-2 font-semibold text-ink">{label}</Text> : null}
      <Pressable
        onPress={() => setShowPicker(true)}
        className={`flex-row items-center justify-between rounded-2xl border bg-white px-4 py-4 ${error ? "border-red-300" : "border-mint-200"}`}
      >
        <Text className={value ? "text-ink" : "text-slate-400"}>{value || "Selecionar data"}</Text>
        <Ionicons name="calendar-outline" size={20} color="#357257" />
      </Pressable>
      {showPicker ? (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          minimumDate={minDate}
          maximumDate={maxDate}
          onChange={(event, date) => {
            if (Platform.OS === "android") setShowPicker(false);
            if (event.type === "dismissed" || !date) return;
            onChange(`${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`);
          }}
        />
      ) : null}
      {Platform.OS === "ios" && showPicker ? (
        <Pressable onPress={() => setShowPicker(false)} className="mt-2 self-end rounded-xl bg-mint-100 px-4 py-2">
          <Text className="font-bold text-mint-800">Concluir</Text>
        </Pressable>
      ) : null}
      {error ? <Text className="mt-1 text-sm text-red-500">{error}</Text> : null}
    </View>
  );
}
