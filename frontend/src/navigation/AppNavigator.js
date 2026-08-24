import React, { createContext, useState, useContext } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../views/screens/LoginScreen';
import RegisterScreen from '../views/screens/RegisterScreen';
import DiagnosticScreen from '../views/screens/DiagnosticScreen';
import MedicamentosScreen from '../views/screens/MedicamentosScreen';
import CriarScreen from '../views/screens/CriarScreen';

const NavigationContext = createContext();

export const useAppNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useAppNavigation deve ser usado dentro de um NavigationProvider');
  }
  return context;
};

export const AppNavigator = () => {
  const { isAuthenticated, role } = useAuth();
  
  // Telas possíveis: 'Login', 'Register', 'App'
  const [currentScreen, setCurrentScreen] = useState('Login');
  // Se estiver na tela 'App', as abas possíveis: 'diagnostico', 'medicamentos', 'criar'
  const [currentTab, setCurrentTab] = useState('diagnostico');
  const [params, setParams] = useState({});

  const navigate = (screenName, screenParams = {}) => {
    setParams(screenParams);
    if (screenName === 'App') {
      setCurrentScreen('App');
      setCurrentTab('diagnostico');
    } else {
      setCurrentScreen(screenName);
    }
  };

  const navigation = {
    navigate,
    params,
    currentTab,
    setCurrentTab,
  };

  // Redirecionamento automático de autenticação
  React.useEffect(() => {
    if (isAuthenticated) {
      setCurrentScreen('App');
    } else {
      setCurrentScreen('Login');
    }
  }, [isAuthenticated]);

  return (
    <NavigationContext.Provider value={navigation}>
      {currentScreen === 'Login' && <LoginScreen />}
      {currentScreen === 'Register' && <RegisterScreen />}
      {currentScreen === 'App' && (
        <>
          {currentTab === 'diagnostico' && <DiagnosticScreen />}
          {currentTab === 'medicamentos' && <MedicamentosScreen />}
          {currentTab === 'criar' && role === 'MEDICO' && <CriarScreen />}
          {currentTab === 'criar' && role !== 'MEDICO' && <DiagnosticScreen />}
        </>
      )}
    </NavigationContext.Provider>
  );
};
