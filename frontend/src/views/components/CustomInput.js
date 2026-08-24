import React from 'react';
import { View, Text, TextInput } from 'react-native';
import UserModel from '../../models/UserModel';

const CustomInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  maskType, // 'cpf' | 'cnpj' | null
  maxLength,
  error,
}) => {
  const handleChangeText = (text) => {
    let formattedText = text;
    if (maskType === 'cpf') {
      formattedText = UserModel.formatCpf(text);
    } else if (maskType === 'cnpj') {
      formattedText = UserModel.formatCnpj(text);
    }
    onChangeText(formattedText);
  };

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-pastel-green-700 font-semibold mb-1 text-sm">
          {label}
        </Text>
      )}
      <TextInput
        className={`bg-white border rounded-lg px-4 py-3 text-slate-800 ${
          error ? 'border-red-400' : 'border-pastel-green-100 focus:border-pastel-green-500'
        }`}
        value={value}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoCapitalize="none"
      />
      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  );
};

export default CustomInput;
