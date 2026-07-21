//Header.tsx
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import styles from "./Header.module.css"; // Создай этот CSS файл или используй общий styles
import logoImg from "../../assets/icons/logo.png";
import avatarImage from "../../assets/icons/avatar.png";
import { LoadingSpinner } from "../LoadingSpinner"; // Твой спиннер

export function Header() {
  const { isAuthenticated, logout, user } = useAuth();

  const limits = user?.eventFiltersInfo;
  const used = limits?.usedCompanyCount ?? 0;
  const total = limits?.companyLimit ?? 0;

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link to="/" aria-label="Главная страница">
          <img
            src={logoImg}
            alt="Логотип Scan.Pub"
            className={styles.logoImage}
            loading="lazy"
          />
        </Link>
      </div>

      <nav className={styles.navLinks}>
        <Link to="/">Главная</Link>
        <a href="#">Тарифы</a>
        <a href="#">FAQ</a>
      </nav>

      <div className={styles.authBlock}>
        {isAuthenticated ? (
          <div className={styles.userInfoContainer}>
            {limits ? (
              <div className={styles.limitsBlockWrapper}>
                <div className={styles.limitsBlock}>
                  <span className={styles.limitLabel}>
                    Использовано компаний
                  </span>
                  <span className={styles.limitValueUsed}>{used}</span>
                </div>
                <div className={styles.limitsBlock}>
                  <span className={styles.limitLabel}>Лимит по компаниям</span>
                  <span className={styles.limitValueTotal}>{total}</span>
                </div>
              </div>
            ) : (
              <div className={styles.loadingSpinnerWrapperForLimits}>
                <LoadingSpinner />
              </div>
            )}

            <div>
              <div className={styles.userRow}>
                <span className={styles.userName}>Иванов И.</span>
                <img
                  src={avatarImage}
                  alt="Аватар пользователя"
                  className={styles.avatar}
                  loading="lazy"
                />
              </div>
              <button
                onClick={logout}
                className={styles.authButtons}
                type="button"
              >
                Выйти
              </button>
            </div>
          </div>
        ) : (
          <>
            <button className={styles.btnRegister}>Зарегистрироваться</button>
            <Link to="/auth" className={styles.btnLogin}>
              Войти
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
