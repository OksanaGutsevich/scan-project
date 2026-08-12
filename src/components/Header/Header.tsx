//Header.tsx
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import styles from "./Header.module.css";
import logoImg from "../../assets/icons/logo.png";
import logoFooterImg from "../../assets/icons/logofooter.png";
import avatarImage from "../../assets/icons/avatar.png";
import { LoadingSpinner } from "../LoadingSpinner";
import { useState } from "react";

export function Header() {
  const { isAuthenticated, logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const limits = user?.eventFiltersInfo;
  const used = limits?.usedCompanyCount ?? 0;
  const total = limits?.companyLimit ?? 0;

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  // Рендер лимитов — они остаются на месте в обоих режимах
  const renderLimits = () => {
    // Если не авторизован — вообще не трогаем лимиты
    if (!isAuthenticated) {
      return null;
    }

    // Если авторизован, но лимитов ещё нет — показываем спиннер
    if (!limits) {
      return (
        <div className={styles.loadingSpinnerWrapperForLimits}>
          <LoadingSpinner />
        </div>
      );
    }

    return (
      <div className={styles.limitsBlockWrapper}>
        <div className={styles.limitsBlock}>
          <span className={styles.limitLabel}>Использовано компаний</span>
          <span className={styles.limitValueUsed}>{used}</span>
        </div>
        <div className={styles.limitsBlock}>
          <span className={styles.limitLabel}>Лимит по компаниям</span>
          <span className={styles.limitValueTotal}>{total}</span>
        </div>
      </div>
    );
  };

  // Блок пользователя/авторизации — только для мобильного меню
  const renderAuthMobile = () => {
    if (isAuthenticated) {
      return (
        <>
          <div className={styles.userRow}>
            <span className={styles.userName}>Иванов И.</span>
            <img
              src={avatarImage}
              alt="Аватар пользователя"
              className={styles.avatar}
              loading="lazy"
            />
          </div>
          <button onClick={logout} className={styles.authButtons} type="button">
            Выйти
          </button>
        </>
      );
    }

    return (
      <>
        <button className={styles.btnRegister} onClick={closeMenu}>
          Зарегистрироваться
        </button>
        <Link to="/auth" className={styles.btnLogin} onClick={closeMenu}>
          Войти
        </Link>
      </>
    );
  };

  return (
    <header className={styles.header}>
      {/* Логотип слева */}
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

      {/* Десктопное меню */}
      <nav className={styles.navLinks}>
        <Link to="/">Главная</Link>
        <a href="#" onClick={closeMenu}>
          Тарифы
        </a>
        <a href="#" onClick={closeMenu}>
          FAQ
        </a>
      </nav>

      {/* Лимиты — всегда видны, и на десктопе, и на мобильном (вне меню) */}
      <div className={styles.limitsDesktopBlock}>{renderLimits()}</div>

      {/* Бургер-кнопка */}
      <button
        onClick={toggleMenu}
        aria-expanded={isMenuOpen}
        aria-controls="mobile-menu"
        className={styles.burgerButton}
        type="button"
      >
        <span className={styles.burgerLine}></span>
        <span className={styles.burgerLine}></span>
        <span className={styles.burgerLine}></span>
      </button>

      {/* Мобильное меню */}
      {isMenuOpen && (
        <nav id="mobile-menu" className={styles.mobileMenu}>
          {/* Логотип в мобильном меню */}
          <div className={styles.mobileMenuHeader}>
            <div>
              <img
                src={logoFooterImg}
                alt="Логотип Scan.Pub"
                className={styles.mobileLogoImage}
                loading="lazy"
              />
            </div>
            <div>
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Закрыть меню"
                className={styles.closeMenuButton}
              >
                &times; {/* символ крестика */}
              </button>
            </div>
          </div>

          <Link to="/" onClick={closeMenu}>
            Главная
          </Link>
          <a href="#" onClick={closeMenu}>
            Тарифы
          </a>
          <a href="#" onClick={closeMenu}>
            FAQ
          </a>

          {/* Сюда выводим пользователя/кнопки входа только на мобильном */}
          <div className={styles.mobileAuthBlock}>{renderAuthMobile()}</div>
        </nav>
      )}

      {/* Блок авторизации (десктоп) — только пользователь/кнопки, без лимитов */}
      <div className={styles.authBlockDesktop}>
        {isAuthenticated ? (
          <div className={styles.userInfoContainer}>
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
