import React, { useState } from "react";
import { useWindowDimensions, View } from "react-native";
import AppInput from "./AppInput";
import CepInlineSearch from "./CepInlineSearch";
import AddressInlineSearch, { formatCepAddress } from "./AddressInlineSearch";
import { maskPhone, onlyDigits } from "../utils/masks";

export default function UnitLocationFields({
  cep,
  address,
  number,
  phone,
  onCepChange,
  onAddressChange,
  onNumberChange,
  onPhoneChange,
  onLocationSelect,
  cepError,
  addressError,
  numberError,
  phoneError,
}) {
  const { width } = useWindowDimensions();
  const wide = width >= 768;
  const [selectedLocation, setSelectedLocation] = useState(() => (
    cep || address ? { cep, formattedAddress: address } : null
  ));

  function selectLocation(item, formattedAddress = formatCepAddress(item)) {
    const selected = { ...item, formattedAddress };
    setSelectedLocation(selected);
    onLocationSelect(selected);
  }

  return (
    <>
      <View style={wide ? { flexDirection: "row", gap: 12, alignItems: "flex-start" } : undefined}>
        <View style={wide ? { flex: 1 } : undefined}>
          <CepInlineSearch
            value={cep}
            onChange={onCepChange}
            onSelect={(item) => selectLocation(item)}
            error={cepError}
            selectedCep={selectedLocation?.cep}
          />
        </View>

        <View style={wide ? { flex: 1 } : undefined}>
          <AppInput
            label="Telefone da unidade"
            value={maskPhone(phone)}
            onChangeText={(value) => onPhoneChange(onlyDigits(value).slice(0, 11))}
            keyboardType="phone-pad"
            inputMode="tel"
            maxLength={15}
            placeholder="(00) 00000-0000"
            error={phoneError}
          />
        </View>
      </View>

      <View style={wide ? { flexDirection: "row", gap: 12, alignItems: "flex-start" } : undefined}>
        <View style={wide ? { flex: 3 } : undefined}>
          <AddressInlineSearch
            value={address}
            onChange={onAddressChange}
            onSelect={(item, formattedAddress) => selectLocation(item, formattedAddress)}
            error={addressError}
            selectedAddress={selectedLocation?.formattedAddress}
          />
        </View>

        <View style={wide ? { flex: 1 } : undefined}>
          <AppInput
            label="Número"
            value={number}
            onChangeText={onNumberChange}
            keyboardType="numeric"
            inputMode="numeric"
            maxLength={8}
            placeholder="120"
            error={numberError}
          />
        </View>
      </View>
    </>
  );
}
