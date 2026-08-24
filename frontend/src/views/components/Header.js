import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useAppNavigation } from '../../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';

const Header = ({ title }) => {
  const { user, role, logout } = useAuth();
  const navigation = useAppNavigation();

  const getRoleLabel = () => {
    switch (role) {
      case 'MEDICO': return 'Médico';
      case 'DONO': return 'Gestor/Dono';
      case 'PACIENTE': return 'Paciente';
      default: return 'Usuário';
    }
  };

  const getRoleBadgeColor = () => {
    switch (role) {
      case 'MEDICO': return 'bg-sky-100 text-sky-800';
      case 'DONO': return 'bg-pastel-green-100 text-pastel-green-700';
      case 'PACIENTE': return 'bg-purple-100 text-purple-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const handleLogout = () => {
    logout(navigation);
  };

  return (
    <SafeAreaView className="bg-pastel-green-50 border-b border-pastel-green-100">
      <View className="px-6 py-4 flex-row justify-between items-center">
        <View className="flex-1 mr-4">
          <Text className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title || 'Saúde App'}
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-lg font-bold text-slate-800 mr-2" numberOfLines={1}>
              {user?.nome_completo || 'Usuário'}
            </Text>
            <View className={`px-2 py-0.5 rounded-full ${getRoleBadgeColor()}`}>
              <Text className="text-[10px] font-bold">{getRoleLabel()}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          className="bg-white border border-pastel-green-100 p-2.5 rounded-xl active:bg-pastel-green-50"
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color="#2E7D32" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Header;
