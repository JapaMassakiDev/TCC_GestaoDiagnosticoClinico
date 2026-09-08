import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";
import LoginScreen from "../screens/auth/LoginScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import ResetPasswordScreen from "../screens/auth/ResetPasswordScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import AppTabs from "./AppTabs";
const Stack = createNativeStackNavigator();
export default function RootNavigator() {
  const { user } = useAuth();
  return <Stack.Navigator screenOptions={{ headerShown: false }}>{!user ? <><Stack.Screen name="Login" component={LoginScreen}/><Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen}/><Stack.Screen name="ResetPassword" component={ResetPasswordScreen}/><Stack.Screen name="Register" component={RegisterScreen}/></> : <Stack.Screen name="Main" component={AppTabs}/>}</Stack.Navigator>;
}
