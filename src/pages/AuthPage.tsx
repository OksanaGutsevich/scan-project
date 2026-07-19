// src/pages/AuthPage.tsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import styles from "./AuthPage.module.css";

export function AuthPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useAuth(); // <-- берём loginUser

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await loginUser(login, password); // <-- вызываем loginUser
      const from =
        (location.state as { from?: { pathname: string } })?.from?.pathname ||
        "/search";
      navigate(from, { replace: true });
    } catch (err: any) {
      let msg = "Ошибка авторизации";
      if (err?.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err?.message) {
        msg = err.message;
      }
      setError(msg);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Вход в систему</h1>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="login" className={styles.label}>
              Логин
            </label>
            <input
              id="login"
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Пароль
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={4}
              className={styles.input}
            />
          </div>
          <button type="submit" className={styles.btn}>
            Войти
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthPage;
