import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DiagnosticController from '../../controllers/DiagnosticController';
import { Ionicons } from '@expo/vector-icons';

const DiagnosticScreen = () => {
  const { role } = useAuth();
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const isDoctor = role === 'MEDICO';

  useEffect(() => {
    DiagnosticController.loadDiagnostics(setDiagnostics, setLoading);
  }, [refreshKey]);

  const handleCancel = async (id) => {
    try {
      await DiagnosticController.cancelDiagnostic(id, setDiagnostics);
      alert('Diagnóstico cancelado com sucesso.');
    } catch (err) {
      alert(err.message || 'Erro ao cancelar diagnóstico.');
    }
  };

  const filteredDiagnostics = diagnostics.filter((d) => {
    const term = search.toLowerCase();
    return (
      d.titulo.toLowerCase().includes(term) ||
      d.descricao.toLowerCase().includes(term) ||
      d.codigo_cid.toLowerCase().includes(term)
    );
  });

  return (
    <View className="flex-1 bg-pastel-green-50">
      {/* Cabeçalho */}
      <Header title="Prontuário Médico" />

      {/* Conteúdo Principal */}
      <View className="flex-1 px-6 pt-4">
        {/* Barra de Pesquisa */}
        <View className="flex-row bg-white border border-pastel-green-100 rounded-2xl px-4 py-2.5 items-center mb-6 shadow-sm">
          <Ionicons name="search-outline" size={20} color="#94A3B8" className="mr-2" />
          <TextInput
            className="flex-1 text-slate-800 text-sm"
            placeholder="Pesquise por diagnóstico, CID-10 ou descrição..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Listagem */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-base font-bold text-slate-800">
            Histórico Clínico ({filteredDiagnostics.length})
          </Text>
          <TouchableOpacity 
            onPress={() => setRefreshKey(prev => prev + 1)}
            className="flex-row items-center"
          >
            <Ionicons name="refresh-outline" size={16} color="#2E7D32" className="mr-1" />
            <Text className="text-xs font-bold text-pastel-green-700">Atualizar</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#2E7D32" />
          </View>
        ) : filteredDiagnostics.length === 0 ? (
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-grow">
            <View className="bg-white p-8 rounded-3xl border border-pastel-green-100 items-center justify-center py-16 shadow-sm">
              <Text className="text-5xl mb-4">📋</Text>
              <Text className="text-base font-bold text-slate-700 text-center">Nenhum registro encontrado</Text>
              <Text className="text-xs text-slate-400 text-center mt-2 px-6">
                Não há diagnósticos emitidos para este histórico clínico até o momento.
              </Text>
            </View>
          </ScrollView>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            {filteredDiagnostics.map((diag) => (
              <View 
                key={diag.id} 
                className={`bg-white p-5 rounded-2xl border mb-4 shadow-sm relative ${
                  diag.status === 'CANCELADO' ? 'border-red-100 opacity-70' : 'border-pastel-green-100'
                }`}
              >
                {/* Cabeçalho do Card */}
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1 mr-2">
                    <Text className="text-sm font-bold text-slate-800" numberOfLines={2}>
                      {diag.titulo}
                    </Text>
                    <Text className="text-[10px] text-slate-400 mt-0.5">
                      Emitido em: {diag.created_at}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="bg-pastel-green-50 border border-pastel-green-100 px-2 py-0.5 rounded-lg mr-1.5">
                      <Text className="text-[9px] font-bold text-pastel-green-700">CID: {diag.codigo_cid}</Text>
                    </View>
                    <View className={`px-2 py-0.5 rounded-lg ${
                      diag.status === 'CANCELADO' ? 'bg-red-100' : 'bg-emerald-100'
                    }`}>
                      <Text className={`text-[9px] font-bold ${
                        diag.status === 'CANCELADO' ? 'text-red-700' : 'text-emerald-700'
                      }`}>
                        {diag.status}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Descrição */}
                <Text className="text-xs text-slate-600 leading-relaxed mb-4">
                  {diag.descricao}
                </Text>

                {/* Rodapé do Card */}
                <View className="flex-row justify-between items-center border-t border-slate-50 pt-3">
                  <Text className="text-[10px] text-slate-400">
                    ID Médico: {diag.medico_id ? diag.medico_id.slice(0, 8) + '...' : 'Desconhecido'}
                  </Text>
                  {isDoctor && diag.status !== 'CANCELADO' && (
                    <TouchableOpacity
                      onPress={() => handleCancel(diag.id)}
                      className="bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg flex-row items-center active:bg-red-100"
                    >
                      <Ionicons name="trash-outline" size={12} color="#DC2626" className="mr-1" />
                      <Text className="text-[10px] font-bold text-red-600">Cancelar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
            <View className="h-6" />
          </ScrollView>
        )}
      </View>

      {/* Rodapé */}
      <Footer />
    </View>
  );
};

export default DiagnosticScreen;
