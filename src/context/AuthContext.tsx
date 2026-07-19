// src/context/AuthContext.tsx
import { createContext, useState } from "react";
import type { ReactNode } from "react";
import apiClient from "../api/client";
import type { LoginResponse } from "../types";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  loginUser: (login: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("accessToken"),
  );
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
    } catch (err) {
      setToken(null);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Экспортируем сам контекст, если кому-то понадобится использовать useContext напрямую
export { AuthContext };
