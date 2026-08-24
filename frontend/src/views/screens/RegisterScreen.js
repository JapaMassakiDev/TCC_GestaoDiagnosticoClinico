import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useAppNavigation } from '../../navigation/AppNavigator';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import SerproController from '../../controllers/SerproController';
import UserModel from '../../models/UserModel';
import { Ionicons } from '@expo/vector-icons';

const RegisterScreen = () => {
  const { register, loading: authLoading } = useAuth();
  const navigation = useAppNavigation();

  // Recupera CPF pré-preenchido vindo do Login
  const prefilledCpf = navigation.params?.cpf || '';

  // Estado dos papéis: 'PACIENTE', 'MEDICO', 'DONO'
  const [role, setRole] = useState('PACIENTE');

  // Campos de Formulário comuns
  const [cpf, setCpf] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // Campos específicos de Médico
  const [crm, setCrm] = useState('');
  const [ufCrm, setUfCrm] = useState('');
  const [especialidade, setEspecialidade] = useState('');

  // Campos específicos de Dono (Tenant)
  const [cnpj, setCnpj] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');

  const [serproLoading, setSerproLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');

  // Preenche o CPF automaticamente se vier da tela de login
  useEffect(() => {
    if (prefilledCpf) {
      setCpf(UserModel.formatCpf(prefilledCpf));
    }
  }, [prefilledCpf]);

  // Consulta à API do SERPRO
  const handleConsultSerpro = async () => {
    setLocalError('');
    setLocalSuccess('');
    try {
      await SerproController.consultCpf(cpf, setSerproLoading, (results) => {
        if (results.nome_completo) {
          setNomeCompleto(results.nome_completo);
        }
      });
      setLocalSuccess('Dados consultados e integrados com sucesso da base do SERPRO (Simulação).');
    } catch (err) {
      setLocalError(err.message || 'Erro ao consultar CPF no SERPRO.');
    }
  };

  const handleRegisterSubmit = async () => {
    setLocalError('');
    setLocalSuccess('');

    const formFields = {
      cpf,
      nome_completo: nomeCompleto,
      email,
      senha,
      // Médico
      crm,
      uf_crm: ufCrm,
      especialidade,
      // Dono
      cnpj,
      razao_social: razaoSocial,
      nome_fantasia: nomeFantasia,
    };

    try {
      await register(formFields, role, navigation);
    } catch (err) {
      setLocalError(err.message || 'Erro ao realizar o cadastro.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-pastel-green-50"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-10">
        <View className="bg-white p-6 rounded-3xl border border-pastel-green-100 shadow-sm">
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity 
              onPress={() => navigation.navigate('Login')}
              className="bg-pastel-green-50 p-2 rounded-xl mr-3 border border-pastel-green-100"
            >
              <Ionicons name="arrow-back-outline" size={20} color="#2E7D32" />
            </TouchableOpacity>
            <View>
              <Text className="text-xl font-bold text-slate-800">Crie sua Conta</Text>
              <Text className="text-xs text-slate-400">Complete seus dados cadastrais</Text>
            </View>
          </View>

          {/* Role Dropdown / Selector */}
          <Text className="text-pastel-green-700 font-semibold mb-2 text-sm">Eu sou um:</Text>
          <View className="flex-row bg-slate-100 p-1 rounded-xl mb-6">
            <TouchableOpacity 
              onPress={() => setRole('PACIENTE')}
              className={`flex-1 py-2.5 rounded-lg items-center ${role === 'PACIENTE' ? 'bg-white shadow-sm' : ''}`}
            >
              <Text className={`text-xs font-bold ${role === 'PACIENTE' ? 'text-pastel-green-700' : 'text-slate-500'}`}>
                Paciente
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setRole('MEDICO')}
              className={`flex-1 py-2.5 rounded-lg items-center ${role === 'MEDICO' ? 'bg-white shadow-sm' : ''}`}
            >
              <Text className={`text-xs font-bold ${role === 'MEDICO' ? 'text-pastel-green-700' : 'text-slate-500'}`}>
                Médico
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setRole('DONO')}
              className={`flex-1 py-2.5 rounded-lg items-center ${role === 'DONO' ? 'bg-white shadow-sm' : ''}`}
            >
              <Text className={`text-xs font-bold ${role === 'DONO' ? 'text-pastel-green-700' : 'text-slate-500'}`}>
                Dono / Gestor
              </Text>
            </TouchableOpacity>
          </View>

          {/* CPF Form Field & SERPRO Lookup */}
          <View className="mb-4">
            <CustomInput
              label="CPF"
              placeholder="000.000.000-00"
              value={cpf}
              onChangeText={setCpf}
              maskType="cpf"
              keyboardType="numeric"
              maxLength={14}
            />
            <TouchableOpacity
              onPress={handleConsultSerpro}
              disabled={serproLoading}
              className="bg-pastel-green-50 self-end px-3 py-1.5 rounded-lg border border-pastel-green-200 mt-1 active:bg-pastel-green-100 flex-row items-center"
            >
              <Ionicons name="search" size={14} color="#2E7D32" className="mr-1" />
              <Text className="text-xs font-bold text-pastel-green-700">
                {serproLoading ? 'Buscando no SERPRO...' : 'Consultar no SERPRO'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* General Fields */}
          <CustomInput
            label="Nome Completo"
            placeholder="Digite seu nome completo"
            value={nomeCompleto}
            onChangeText={setNomeCompleto}
          />

          <CustomInput
            label="E-mail"
            placeholder="exemplo@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <CustomInput
            label="Senha (Mínimo 8 caracteres)"
            placeholder="Crie uma senha forte"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />

          {/* Conditional Fields: MEDICO */}
          {role === 'MEDICO' && (
            <View className="bg-sky-50/50 p-4 rounded-2xl border border-sky-100 mb-4">
              <Text className="text-sky-800 font-bold text-sm mb-3">Registro de Classe (Médico)</Text>
              
              <CustomInput
                label="CRM"
                placeholder="000000"
                value={crm}
                onChangeText={setCrm}
                keyboardType="numeric"
              />

              <CustomInput
                label="UF do CRM"
                placeholder="EX: SP, RJ, MG"
                value={ufCrm}
                onChangeText={setUfCrm}
                maxLength={2}
              />

              <CustomInput
                label="Especialidade"
                placeholder="EX: Cardiologia, Pediatria"
                value={especialidade}
                onChangeText={setEspecialidade}
              />
            </View>
          )}

          {/* Conditional Fields: DONO */}
          {role === 'DONO' && (
            <View className="bg-pastel-green-50/50 p-4 rounded-2xl border border-pastel-green-100 mb-4">
              <Text className="text-pastel-green-700 font-bold text-sm mb-3">Dados da Instituição de Saúde</Text>
              
              <CustomInput
                label="CNPJ"
                placeholder="00.000.000/0000-00"
                value={cnpj}
                onChangeText={setCnpj}
                maskType="cnpj"
                keyboardType="numeric"
                maxLength={18}
              />

              <CustomInput
                label="Razão Social"
                placeholder="Ex: Clínica Médica Silva Ltda"
                value={razaoSocial}
                onChangeText={setRazaoSocial}
              />

              <CustomInput
                label="Nome Fantasia"
                placeholder="Ex: Clínica Saúde e Vida"
                value={nomeFantasia}
                onChangeText={setNomeFantasia}
              />
            </View>
          )}

          {/* Alerts / Error Feedback */}
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

          {/* Actions */}
          <View className="pt-2">
            <CustomButton
              title="Cadastrar"
              onPress={handleRegisterSubmit}
              loading={authLoading}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
