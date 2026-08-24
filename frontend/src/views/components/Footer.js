import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useAppNavigation } from '../../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';

const Footer = () => {
  const { role } = useAuth();
  const { currentTab, setCurrentTab } = useAppNavigation();

  const isDoctor = role === 'MEDICO';

  return (
    <SafeAreaView className="bg-white border-t border-pastel-green-100">
      <View className="flex-row justify-around py-3 px-2">
        {/* Tab Diagnóstico */}
        <TouchableOpacity
          className="items-center justify-center flex-1"
          onPress={() => setCurrentTab('diagnostico')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={currentTab === 'diagnostico' ? 'document-text' : 'document-text-outline'}
            size={24}
            color={currentTab === 'diagnostico' ? '#2E7D32' : '#94A3B8'}
          />
          <Text
            className={`text-xs mt-1 ${
              currentTab === 'diagnostico' ? 'text-pastel-green-700 font-bold' : 'text-slate-400'
            }`}
          >
            Diagnósticos
          </Text>
        </TouchableOpacity>

        {/* Tab Medicamentos */}
        <TouchableOpacity
          className="items-center justify-center flex-1"
          onPress={() => setCurrentTab('medicamentos')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={currentTab === 'medicamentos' ? 'bandage' : 'bandage-outline'}
            size={24}
            color={currentTab === 'medicamentos' ? '#2E7D32' : '#94A3B8'}
          />
          <Text
            className={`text-xs mt-1 ${
              currentTab === 'medicamentos' ? 'text-pastel-green-700 font-bold' : 'text-slate-400'
            }`}
          >
            Medicamentos
          </Text>
        </TouchableOpacity>

        {/* Tab Criar (Médico apenas) */}
        {isDoctor && (
          <TouchableOpacity
            className="items-center justify-center flex-1"
            onPress={() => setCurrentTab('criar')}
            activeOpacity={0.7}
          >
            <Ionicons
              name={currentTab === 'criar' ? 'add-circle' : 'add-circle-outline'}
              size={24}
              color={currentTab === 'criar' ? '#2E7D32' : '#94A3B8'}
            />
            <Text
              className={`text-xs mt-1 ${
                currentTab === 'criar' ? 'text-pastel-green-700 font-bold' : 'text-slate-400'
              }`}
            >
              Criar
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Footer;
