import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth } from "../contexts/AuthContext";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import AppTabs from "./AppTabs";
import ShareQrScreen from "../screens/diagnosis/ShareQrScreen";
import ScannerScreen from "../screens/diagnosis/ScannerScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={AppTabs} />
          <Stack.Screen name="ShareQr" component={ShareQrScreen} />
          <Stack.Screen name="Scanner" component={ScannerScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
