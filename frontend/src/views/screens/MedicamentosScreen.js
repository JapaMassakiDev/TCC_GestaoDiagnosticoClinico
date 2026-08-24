import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Ionicons } from '@expo/vector-icons';

const MedicamentosScreen = () => {
  // Mock de medicamentos prescritos para deixar a tela apresentável
  const mockMedicamentos = [
    { id: '1', nome: 'Metformina 850mg', dosagem: '1 comprimido ao dia', horario: 'Durante o café da manhã', status: 'Ativo' },
    { id: '2', nome: 'Losartana Potássica 50mg', dosagem: '1 comprimido a cada 12 horas', horario: '08:00 e 20:00', status: 'Ativo' },
    { id: '3', nome: 'Salbutamol Aerossol 100mcg', dosagem: '2 jatos se houver falta de ar', horario: 'Uso esporádico (resgate)', status: 'Suspenso' }
  ];

  return (
    <View className="flex-1 bg-pastel-green-50">
      {/* Cabeçalho */}
      <Header title="Farmácia & Receitas" />

      {/* Conteúdo Principal */}
      <View className="flex-1 px-6 pt-4">
        <Text className="text-base font-bold text-slate-800 mb-4">Medicamentos Prescritos</Text>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="bg-white p-5 rounded-3xl border border-pastel-green-100 shadow-sm mb-6">
            <View className="flex-row items-center mb-3">
              <View className="bg-pastel-green-100 p-2 rounded-xl mr-3">
                <Ionicons name="information-circle-outline" size={20} color="#2E7D32" />
              </View>
              <Text className="text-xs text-slate-500 flex-1 leading-relaxed">
                Esta tela lista as medicações registradas ativas e o cronograma de dosagens prescrito pelo seu médico assistente.
              </Text>
            </View>
          </View>

          {mockMedicamentos.map((med) => (
            <View 
              key={med.id} 
              className={`bg-white p-5 rounded-2xl border mb-4 shadow-sm flex-row items-center ${
                med.status === 'Suspenso' ? 'border-red-100 opacity-60' : 'border-pastel-green-100'
              }`}
            >
              <View className={`p-3 rounded-xl mr-4 ${med.status === 'Suspenso' ? 'bg-red-50' : 'bg-pastel-green-50'}`}>
                <Ionicons 
                  name={med.status === 'Suspenso' ? 'close-circle' : 'medical'} 
                  size={24} 
                  color={med.status === 'Suspenso' ? '#DC2626' : '#4CAF50'} 
                />
              </View>
              
              <View className="flex-1">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-sm font-bold text-slate-800">{med.nome}</Text>
                  <View className={`px-2 py-0.5 rounded-md ${med.status === 'Suspenso' ? 'bg-red-100' : 'bg-emerald-100'}`}>
                    <Text className={`text-[9px] font-bold ${med.status === 'Suspenso' ? 'text-red-700' : 'text-emerald-700'}`}>
                      {med.status}
                    </Text>
                  </View>
                </View>
                <Text className="text-xs text-slate-500">Dosagem: {med.dosagem}</Text>
                <Text className="text-[10px] text-slate-400 mt-1 flex-row items-center">
                  🕒 Horários: {med.horario}
                </Text>
              </View>
            </View>
          ))}
          <View className="h-6" />
        </ScrollView>
      </View>

      {/* Rodapé */}
      <Footer />
    </View>
  );
};

export default MedicamentosScreen;
