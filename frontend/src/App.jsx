import React from "react";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { token, loading } = useAuth();
  if (loading) return <div className="screen-loader">Loading workspace...</div>;
  return token ? <DashboardPage /> : <AuthPage />;
}
