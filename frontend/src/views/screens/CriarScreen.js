import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import DiagnosticController from '../../controllers/DiagnosticController';
import { useAppNavigation } from '../../navigation/AppNavigator';

const CriarScreen = () => {
  const navigation = useAppNavigation();

  // Campos do formulário
  const [pacienteId, setPacienteId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [codigoCid, setCodigoCid] = useState('');

  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');

  const handleSubmit = async () => {
    setLocalError('');
    setLocalSuccess('');
    setLoading(true);

    const fields = {
      paciente_id: pacienteId,
      titulo,
      descricao,
      codigo_cid: codigoCid,
    };

    try {
      await DiagnosticController.createDiagnostic(fields);
      setLocalSuccess('Diagnóstico emitido e gravado no prontuário do paciente.');
      
      // Limpa os campos
      setPacienteId('');
      setTitulo('');
      setDescricao('');
      setCodigoCid('');
      
      // Redireciona de volta para a aba de diagnósticos após 1.5 segundos
      setTimeout(() => {
        navigation.setCurrentTab('diagnostico');
      }, 1500);
    } catch (err) {
      setLocalError(err.message || 'Erro ao emitir diagnóstico.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-pastel-green-50"
    >
      {/* Cabeçalho */}
      <Header title="Área do Médico" />

      {/* Conteúdo Principal */}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 pt-4">
        <View className="bg-white p-6 rounded-3xl border border-pastel-green-100 shadow-sm mb-6">
          <Text className="text-base font-bold text-slate-800 mb-4">Emitir Diagnóstico Clínico</Text>

          <CustomInput
            label="ID do Paciente (UUID)"
            placeholder="Ex: 550e8400-e29b-41d4-a716-446655440000"
            value={pacienteId}
            onChangeText={setPacienteId}
            keyboardType="default"
          />

          <CustomInput
            label="Título do Diagnóstico"
            placeholder="Ex: Hipertensão Arterial Sistêmica"
            value={titulo}
            onChangeText={setTitulo}
          />

          <CustomInput
            label="Código CID-10"
            placeholder="Ex: I10"
            value={codigoCid}
            onChangeText={setCodigoCid}
            autoCapitalize="characters"
          />

          <CustomInput
            label="Descrição / Detalhes Clínicos"
            placeholder="Descreva o quadro do paciente e as orientações prescritas..."
            value={descricao}
            onChangeText={setDescricao}
            maxLength={500}
          />

          {localError ? (
            <View className="bg-red-50 p-3 rounded-lg border border-red-200 mb-4">
              <Text className="text-red-600 text-xs text-center font-medium">{localError}</Text>
            </View>
          ) : null}

          {localSuccess ? (
            <View className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 mb-4">
              <Text className="text-emerald-700 text-xs text-center font-medium">{localSuccess}</Text>
            </View>
          ) : null}

          <View className="pt-2">
            <CustomButton
              title="Emitir Diagnóstico"
              onPress={handleSubmit}
              loading={loading}
            />
          </View>
        </View>
      </ScrollView>

      {/* Rodapé */}
      <Footer />
    </KeyboardAvoidingView>
  );
};

export default CriarScreen;
