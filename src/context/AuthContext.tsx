// src/context/AuthContext.ts
import { createContext, useContext, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  token: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // В реальности читай token из localStorage/cookie
  const token = localStorage.getItem("accessToken");
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ isAuthenticated, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
