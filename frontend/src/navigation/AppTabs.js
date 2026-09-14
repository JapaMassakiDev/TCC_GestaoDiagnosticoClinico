import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { usarAutenticacao } from "../contexts/AuthenticationContext";
import { ProvedorAutorizacao } from "../contexts/AuthorizationContext";
import TelaDiagnosticos from "../screens/diagnostico/TelaDiagnosticos";
import TelaCriarDiagnostico from "../screens/criar/TelaCriarDiagnostico";
import TelaGestao from "../screens/gestao/TelaGestao";
import TelaPerfil from "../screens/perfil/TelaPerfil";

const Tab = createBottomTabNavigator();

export default function AbasApp() {
  const { usuario, telaAtual, registrarTela } = usarAutenticacao();
  const screensPermitidas = usuario?.role === "medico" ? ["Diagnósticos", "Criar", "Perfil"] : usuario?.role === "dono" ? ["Gestão", "Perfil"] : ["Diagnósticos", "Perfil"];
  const telaInicial = screensPermitidas.includes(telaAtual) ? telaAtual : screensPermitidas[0];

  const icons = {
    Diagnósticos: "document-text-outline",
    Criar: "add-circle-outline",
    Gestão: "business-outline",
    Perfil: "person-circle-outline",
  };

  return (
    <ProvedorAutorizacao>
      <Tab.Navigator
      key={usuario?.role || "guest"}
      initialRouteName={telaInicial}
      screenListeners={({ route }) => ({ focus: () => registrarTela(route.name) })}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#3F8F68",
        tabBarInactiveTintColor: "#86958F",
        tabBarStyle: {
          height: 68,
          paddingBottom: 10,
          paddingTop: 8,
          backgroundColor: "#fff",
          borderTopColor: "#E4F6EC",
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={icons[route.name] || "ellipse-outline"} size={size} color={color} />
        ),
      })}
    >
      {usuario?.role === "paciente" ? (
        <>
          <Tab.Screen name="Diagnósticos" component={TelaDiagnosticos} />
          <Tab.Screen name="Perfil" component={TelaPerfil} />
        </>
      ) : null}

      {usuario?.role === "medico" ? (
        <>
          <Tab.Screen name="Diagnósticos" component={TelaDiagnosticos} />
          <Tab.Screen name="Criar" component={TelaCriarDiagnostico} />
          <Tab.Screen name="Perfil" component={TelaPerfil} />
        </>
      ) : null}

      {usuario?.role === "dono" ? (
        <>
          <Tab.Screen name="Gestão" component={TelaGestao} />
          <Tab.Screen name="Perfil" component={TelaPerfil} />
        </>
      ) : null}

      {!['paciente', 'medico', 'dono'].includes(usuario?.role) ? (
        <Tab.Screen name="Perfil" component={TelaPerfil} />
      ) : null}
      </Tab.Navigator>
    </ProvedorAutorizacao>
  );
}
