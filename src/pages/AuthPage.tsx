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
import lockImage from "../../src/assets/icons/lock.png";

const formatPhone = (value: string): string => {
  const clean = value.replace(/[^0-9+]/g, "");
  if (!clean) return "";

  if (!clean.startsWith("+")) {
    if (clean[0] === "7") {
      return "+7" + clean.slice(1);
    }
    return clean;
  }

  const digits = clean.slice(1).replace(/\D/g, "");
  const limited = digits.slice(0, 11);

  if (limited.length === 0) return "+";
  if (limited.length === 1) return `+${limited}`;
  if (limited.length <= 3) return `+${limited[0]} ${limited.slice(1)}`;
  if (limited.length <= 6)
    return `+${limited[0]} ${limited.slice(1, 4)} ${limited.slice(4)}`;
  if (limited.length <= 9)
    return `+${limited[0]} ${limited.slice(1, 4)} ${limited.slice(4, 7)} ${limited.slice(7)}`;
  return `+${limited[0]} ${limited.slice(1, 4)} ${limited.slice(4, 7)} ${limited.slice(7, 9)} ${limited.slice(9)}`;
};

const validateLogin = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return { valid: false, message: "Поле обязательно" };

  if (trimmed.startsWith("+")) {
    if (/[a-zA-Z]/u.test(trimmed)) {
      return { valid: false, message: "Введены некорректные данные" };
    }

    const digitsOnly = trimmed.replace(/\D/g, "");
    if (digitsOnly.length < 10 || digitsOnly.length > 11) {
      return { valid: false, message: "Некорректный номер телефона" };
    }

    return { valid: true, message: null, type: "phone" as const };
  }

  if (/\s/.test(trimmed)) {
    return { valid: false, message: "Пробелы в логине не допускаются" };
  }

  if (trimmed.length < 3) {
    return { valid: false, message: "Логин слишком короткий" };
  }

  return { valid: true, message: null, type: "login" as const };
};

export function AuthPage() {
  const [rawInput, setRawInput] = useState("");
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");

  // Ошибки
  const [error, setError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null); // ошибки от сервера
  // passwordValidationError больше не храним в стейте! Вычисляем на лету
  // const [passwordValidationError, ...] <-- УДАЛИТЬ

  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useAuth();

  const loginValidation = validateLogin(rawInput);
  const isLoginValid = loginValidation.valid;

  const isPasswordEmpty = password.length === 0;
  const isPasswordValid = password.length >= 4;

  // ✅ ВЫЧИСЛЯЕМ ОШИБКУ ВАЛИДАЦИИ ПРЯМО ЗДЕСЬ (не в useEffect!)
  const passwordValidationError: string | null = isPasswordEmpty
    ? "Неправльный пароль"
    : !isPasswordValid
      ? "Пароль должен содержать не менее 4 символов"
      : null;

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setRawInput(raw);

    if (raw.startsWith("+") && !/[a-zA-Z]/u.test(raw)) {
      const formatted = formatPhone(raw);
      setRawInput(formatted);
      setLoginValue(formatted.replace(/\D/g, ""));
    } else {
      setLoginValue(raw);
    }

    const res = validateLogin(raw);
    setLoginError(res.message);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    // Сбрасываем ошибку сервера при начале ввода
    if (passwordError) setPasswordError(null);
    // passwordValidationError пересчитается автоматически при следующем рендере
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Проверка валидации перед отправкой
    if (isPasswordEmpty || !isPasswordValid) {
      // passwordValidationError уже содержит нужное сообщение
      return;
    }

    try {
      await loginUser(loginValue, password);
      const from =
        (location.state as { from?: { pathname: string } })?.from?.pathname ||
        "/";
      navigate(from, { replace: true });
    } catch (err: unknown) {
      let msg = "Ошибка авторизации";

      if (err instanceof Error) msg = err.message;
      else if (typeof err === "string") msg = err;

      const lower = msg.toLowerCase();

      if (
        lower.includes("invalid") ||
        lower.includes("wrong") ||
        lower.includes("unauthorized") ||
        lower.includes("неверный")
      ) {
        setPasswordError("Неправильный пароль");
        // Сбрасываем клиентскую валидацию, чтобы не было двух сообщений
        // (но она и так не появится, так как пароль не пустой)
      } else {
        setError(msg);
      }
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

          <div className={styles.authLayout}>
            <img
              src={lockImage}
              alt=""
              className={styles.overlayImage}
              aria-hidden="true"
            />

            <div className={styles.card}>
              <div className={styles.topAuthButtons}>
                <Link to="/auth" className={styles.btnLogin}>
                  Войти
                </Link>
                <button className={styles.btnRegister}>
                  Зарегистрироваться
                </button>
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <form onSubmit={handleSubmit}>
                {/* Логин / телефон */}
                <div className={styles.formGroup}>
                  <label htmlFor="login" className={styles.label}>
                    Логин или номер телефона
                  </label>
                  <input
                    id="login"
                    type="text"
                    value={rawInput}
                    onChange={handleLoginChange}
                    required
                    className={
                      loginError
                        ? `${styles.input} ${styles.inputError}`
                        : styles.input
                    }
                    aria-invalid={!!loginError}
                    aria-describedby={
                      loginError ? "login-error-msg" : undefined
                    }
                  />
                  {loginError && (
                    <div
                      id="login-error-msg"
                      className={styles.loginErrorText}
                      role="alert"
                    >
                      {loginError}
                    </div>
                  )}
                </div>

                {/* Пароль */}
                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.label}>
                    Пароль
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    minLength={4}
                    className={
                      passwordError || passwordValidationError
                        ? `${styles.input} ${styles.inputError}`
                        : styles.input
                    }
                    aria-invalid={!!(passwordError || passwordValidationError)}
                    aria-describedby={
                      (passwordError ? "password-error-msg" : "") ||
                      (passwordValidationError ? "password-validation-msg" : "")
                    }
                  />

                  {/* Сообщение валидации (клиент) */}
                  {passwordValidationError && (
                    <div
                      id="password-validation-msg"
                      className={styles.passwordErrorText}
                      role="alert"
                    >
                      {passwordValidationError}
                    </div>
                  )}

                  {/* Сообщение от сервера */}
                  {passwordError && (
                    <div
                      id="password-error-msg"
                      className={styles.passwordErrorText}
                      role="alert"
                    >
                      {passwordError}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className={styles.btn}
                  disabled={
                    !isLoginValid || isPasswordEmpty || !isPasswordValid
                  }
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
                    aria-label="Яндекс"
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
                    aria-label="Google"
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
                    aria-label="Facebook"
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
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default AuthPage;
