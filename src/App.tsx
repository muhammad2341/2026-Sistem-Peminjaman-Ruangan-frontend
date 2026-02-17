import React from "react";
import { useAuth } from "./auth/AuthContext";
import { AdminPage } from "./components/AdminPage";
import { BorrowerPage } from "./components/BorrowerPage";
import { LoginPage } from "./components/LoginPage";
import "./App.css";

function App() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  if (user.role === "Admin") {
    return <AdminPage displayName={user.displayName} onLogout={logout} />;
  }

  if (user.role === "Peminjam") {
    return <BorrowerPage displayName={user.displayName} onLogout={logout} />;
  }

  return <LoginPage />;
}

export default App;
