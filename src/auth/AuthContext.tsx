import React, { createContext, useContext, useMemo, useState } from "react";
import {
  apiService,
  LoginRequest,
  LoginResponse,
  UserRole,
} from "../services/api";

const AUTH_STORAGE_KEY = "room_booking_auth";

export type AuthUser = {
  username: string;
  displayName: string;
  role: UserRole;
  token: string;
  expiresAt: number;
};

type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapLoginResponse(response: LoginResponse): AuthUser {
  return {
    username: response.username,
    displayName: response.displayName,
    role: response.role,
    token: response.token,
    expiresAt: Date.now() + response.expiresInSeconds * 1000,
  };
}

function loadStoredAuth(): AuthUser | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed.token || Date.now() >= parsed.expiresAt) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(() => loadStoredAuth());

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: !!user,
      login: async (payload) => {
        const response = await apiService.login(payload);
        const mapped = mapLoginResponse(response);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mapped));
        setUser(mapped);
      },
      logout: () => {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
