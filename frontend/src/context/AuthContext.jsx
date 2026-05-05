import React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import apiClient from "../api/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    async function loadMe() {
      if (!token) return setLoading(false);
      try {
        const data = await apiClient.get("/auth/me");
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } catch {
        logout(false);
      } finally {
        setLoading(false);
      }
    }
    loadMe();
  }, [token]);

  function setSession(nextToken, nextUser) {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem("token", nextToken);
    localStorage.setItem("user", JSON.stringify(nextUser));
  }

  async function login(payload) {
    const data = await apiClient.post("/auth/login", payload);
    setSession(data.token, data.user);
    toast.success(data.message || "Login successful");
  }

  async function signup(payload) {
    const data = await apiClient.post("/auth/signup", payload);
    setSession(data.token, data.user);
    toast.success(data.message || "Signup successful");
  }

  function logout(showToast = true) {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (showToast) toast.success("Logged out");
  }

  const value = useMemo(() => ({ token, user, loading, login, signup, logout }), [token, user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
