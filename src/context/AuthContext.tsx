// src/context/AuthContext.tsx
import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import apiClient from "../api/client";
import type { LoginResponse, AccountInfoResponse } from "../types";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: { eventFiltersInfo?: AccountInfoResponse["eventFiltersInfo"] } | null;
  loginUser: (login: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("accessToken"),
  );
  const [user, setUser] = useState<{
    eventFiltersInfo?: AccountInfoResponse["eventFiltersInfo"];
  } | null>(null);
  const isAuthenticated = !!token;

  const loginUser = async (login: string, password: string) => {
    try {
      const res = await apiClient.post<LoginResponse>("/api/v1/account/login", {
        login,
        password,
      });

      const accessToken = res.data.accessToken;
      localStorage.setItem("accessToken", accessToken);
      setToken(accessToken);

      // В фоне запрашиваем лимиты аккаунта
      const infoRes = await apiClient.get<AccountInfoResponse>(
        "/api/v1/account/info",
      );
      setUser({ eventFiltersInfo: infoRes.data.eventFiltersInfo });
    } catch (err) {
      setToken(null);
      setUser(null);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setToken(null);
    setUser(null);
  };

  // Если страница перезагружена и токен есть — восстанавливаем лимиты
  useEffect(() => {
    if (token && !user) {
      apiClient
        .get<AccountInfoResponse>("/api/v1/account/info")
        .then((res) => setUser({ eventFiltersInfo: res.data.eventFiltersInfo }))
        .catch(() => setUser(null));
    }
  }, [token, user]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, token, user, loginUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
