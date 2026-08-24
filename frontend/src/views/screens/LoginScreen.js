import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useAppNavigation } from '../../navigation/AppNavigator';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

const LoginScreen = () => {
  const { login, loading } = useAuth();
  const navigation = useAppNavigation();
  
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [localError, setLocalError] = useState('');

  const handleLoginSubmit = async () => {
    setLocalError('');
    if (!cpf || !senha) {
      setLocalError('Por favor, preencha CPF e senha.');
      return;
    }

    try {
      await login(cpf, senha, navigation);
    } catch (err) {
      // O AuthController já gerencia o redirecionamento automático
      // se for erro de usuário não cadastrado.
      setLocalError(err.message || 'Erro ao fazer login.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-pastel-green-50"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 justify-center">
        <View className="bg-white p-6 rounded-3xl border border-pastel-green-100 shadow-sm">
          {/* Header/Logo section */}
          <View className="items-center mb-8">
            <View className="bg-pastel-green-100 p-4 rounded-full mb-3">
              <Text className="text-3xl">🩺</Text>
            </View>
            <Text className="text-2xl font-bold text-slate-800 text-center">
              Gestão Clínica
            </Text>
            <Text className="text-sm text-slate-400 text-center mt-1">
              Auxílio de Diagnóstico & Prontuários
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            <CustomInput
              label="CPF"
              placeholder="000.000.000-00"
              value={cpf}
              onChangeText={setCpf}
              maskType="cpf"
              keyboardType="numeric"
              maxLength={14}
            />

            <CustomInput
              label="Senha"
              placeholder="Digite sua senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
            />

            {localError ? (
              <View className="bg-red-50 p-3 rounded-lg border border-red-200 mt-2">
                <Text className="text-red-600 text-xs text-center font-medium">
                  {localError}
                </Text>
              </View>
            ) : null}

            <View className="pt-4">
              <CustomButton
                title="Entrar"
                onPress={handleLoginSubmit}
                loading={loading}
              />
            </View>
          </View>

          {/* Quick info / footer note */}
          <Text className="text-center text-xs text-slate-400 mt-6 leading-relaxed">
            Se for o seu primeiro acesso com este CPF, você será redirecionado para a tela de cadastro automaticamente.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
