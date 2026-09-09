import React, { createContext, useContext, useState } from "react";
import { loginWithCpf, registerUser, updateProfile } from "../services/authService";
import { setApiToken } from "../services/api";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  async function signIn(cpf, password) {
    setLoading(true);
    try {
      const data = await loginWithCpf({ cpf, password });
      setUser({ ...data.user });
      setToken(data.token);
      setApiToken(data.token);
      return data;
    } finally { setLoading(false); }
  }

  async function signUp(payload) {
    setLoading(true);
    try {
      const data = await registerUser(payload);
      setUser({ ...data.user });
      setToken(data.token);
      setApiToken(data.token);
      return data;
    } finally { setLoading(false); }
  }

  async function saveProfile(payload) {
    setLoading(true);
    try {
      const data = await updateProfile(user.id, payload);
      setUser({ ...data.user });
      return data.user;
    } finally { setLoading(false); }
  }

  function signOut() { setUser(null); setToken(null); setApiToken(null); }

  return <AuthContext.Provider value={{ user, token, loading, signIn, signUp, saveProfile, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
