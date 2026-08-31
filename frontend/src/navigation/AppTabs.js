import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../contexts/AuthContext";
import DiagnosisScreen from "../screens/diagnosis/DiagnosisScreen";
import CreateDiagnosisScreen from "../screens/create/CreateDiagnosisScreen";
import ManagementScreen from "../screens/management/ManagementScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#3F8F68",
        tabBarInactiveTintColor: "#86958F",
        tabBarStyle: {
          height: 68,
          paddingBottom: 10,
          paddingTop: 8,
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E4F6EC"
        },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Diagnósticos: "document-text-outline",
            Criar: "add-circle-outline",
            Gestão: "business-outline",
            Perfil: "person-circle-outline"
          };

          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        }
      })}
    >
      {(user.role === "paciente" || user.role === "medico") && (
        <Tab.Screen name="Diagnósticos" component={DiagnosisScreen} />
      )}

      {user.role === "medico" && (
        <Tab.Screen name="Criar" component={CreateDiagnosisScreen} />
      )}

      {user.role === "dono" && (
        <Tab.Screen name="Gestão" component={ManagementScreen} />
      )}

      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
