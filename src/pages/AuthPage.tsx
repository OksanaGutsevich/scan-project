// src/pages/AuthPage.tsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import styles from "./AuthPage.module.css";
import { Header } from "../components/Header/Header";
import { Footer } from "../components/Footer/Footer";
import haractersImage from "../../src/assets/icons/haracters.png";
import { Link } from "react-router-dom";
import facebookIcon from "../../src/assets/icons/facebook.png";
import googleIcon from "../../src/assets/icons/google.png";
import yandexIcon from "../../src/assets/icons/yandex.png";

export function AuthPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useAuth();

  // Вычисляем, валидна ли форма
  const isFormValid = login.trim().length > 0 && password.trim().length >= 4;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isFormValid) {
      setError("Заполните логин и пароль");
      return;
    }

    try {
      await loginUser(login, password);
      const from =
        (location.state as { from?: { pathname: string } })?.from?.pathname ||
        "/";
      navigate(from, { replace: true });
    } catch (err: unknown) {
      let msg = "Ошибка авторизации";

      if (err instanceof Error) {
        msg = err.message;
      } else if (typeof err === "string") {
        msg = err;
      }

      setError(msg);
    }
  };

  const handleSocialLogin = (provider: "yandex" | "google" | "facebook") => {
    console.log(`Запуск авторизации через ${provider}`);
  };

  return (
    <div className={styles.container}>
      <Header />

      <main>
        <div className={styles.mainWrapper}>
          <div>
            <h2 className={styles.mainTitle}>
              Для оформления подписки <br /> на тариф, необходимо
              авторизоваться.
            </h2>
            <img
              src={haractersImage}
              alt=""
              className={styles.haractersImage}
              aria-hidden="true"
            />
          </div>

          <div className={styles.card}>
            <div className={styles.topAuthButtons}>
              <Link to="/auth" className={styles.btnLogin}>
                Войти
              </Link>
              <button className={styles.btnRegister}>Зарегистрироваться</button>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="login" className={styles.label}>
                  Логин или номер телефона
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

              <button
                type="submit"
                className={styles.btn}
                disabled={!isFormValid} // <-- отключаем кнопку, если форма невалидна
              >
                Войти
              </button>
            </form>

            <div className={styles.forgotPasswordBlock}>
              <Link
                to="/restore-password"
                className={styles.forgotPasswordLink}
              >
                Восстановить пароль
              </Link>
            </div>

            <div className={styles.socialAuthBlock}>
              <span className={styles.socialAuthText}>Войти через:</span>
              <div className={styles.socialIcons}>
                <button
                  type="button"
                  className={`${styles.socialBtn} ${styles.yandexBtn}`}
                  onClick={() => handleSocialLogin("yandex")}
                  aria-label="Войти через Яндекс"
                >
                  <img
                    src={yandexIcon}
                    alt="Яндекс"
                    className={styles.iconImg}
                    loading="lazy"
                  />
                </button>

                <button
                  type="button"
                  className={`${styles.socialBtn} ${styles.googleBtn}`}
                  onClick={() => handleSocialLogin("google")}
                  aria-label="Войти через Google"
                >
                  <img
                    src={googleIcon}
                    alt="Google"
                    className={styles.iconImg}
                    loading="lazy"
                  />
                </button>

                <button
                  type="button"
                  className={`${styles.socialBtn} ${styles.facebookBtn}`}
                  onClick={() => handleSocialLogin("facebook")}
                  aria-label="Войти через Facebook"
                >
                  <img
                    src={facebookIcon}
                    alt="Facebook"
                    className={styles.iconImg}
                    loading="lazy"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default AuthPage;
