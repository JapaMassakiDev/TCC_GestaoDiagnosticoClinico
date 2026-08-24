import React, { createContext, useState, useContext } from 'react';
import AuthController from '../controllers/AuthController';
import { setClientHeaders } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    user: null, // { id, cpf, nome_completo, email }
    role: null, // 'PACIENTE', 'MEDICO', 'DONO'
    activeTenantId: null,
    isAuthenticated: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (cpf, password, navigation) => {
    setLoading(true);
    setError(null);
    try {
      await AuthController.login(cpf, password, navigation, (updatedState) => {
        setAuthState(updatedState);
      });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formFields, role, navigation) => {
    setLoading(true);
    setError(null);
    try {
      await AuthController.register(formFields, role, navigation, (updatedState) => {
        setAuthState(updatedState);
      });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = (navigation) => {
    AuthController.logout((clearedState) => {
      setAuthState(clearedState);
    }, navigation);
  };

  const updateActiveTenant = (tenantId) => {
    setAuthState((prev) => {
      const updated = { ...prev, activeTenantId: tenantId };
      setClientHeaders(prev.token, tenantId);
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        loading,
        error,
        setError,
        login,
        register,
        logout,
        updateActiveTenant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider.');
  }
  return context;
};
