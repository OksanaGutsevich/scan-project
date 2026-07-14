// src/pages/AuthPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import type { LoginRequest, LoginResponse } from "../types";

export function AuthPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const payload: LoginRequest = { login, password };
      const res = await apiClient.post<LoginResponse>(
        "/api/v1/account/login",
        payload,
      );

      localStorage.setItem("accessToken", res.data.accessToken);
      navigate("/search");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Ошибка авторизации";
      setError(msg);
    }
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: "1.5rem", fontSize: "20px" }}>
        Вход в систему
      </h1>
      {error && (
        <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "0.75rem" }}>
          <label>Логин</label>
          <input
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <button type="submit" className="blue-button">
          Войти
        </button>
      </form>
    </div>
  );
}

export default AuthPage;
