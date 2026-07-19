// src/pages/HomePage.tsx
import { Link } from "react-router-dom";
import { WhyWeCarousel } from "../components/WhyWeCarousel";
import { WHY_WE_CARDS } from "../mock/mockData";
import { useAuth } from "../hooks/useAuth";
import styles from "./HomePage.module.css";
import logoImg from "../assets/icons/logo.png";
import logoImgFooter from "../assets/icons/logofooter.png";
import mainImage from "../assets/icons/main.png";
import avatarImage from "../assets/icons/avatar.png";
import secondaryImage from "../assets/icons/secondary.png";
import { TariffCard } from "../components/TariffCard";
import beginnerImage from "../assets/icons/beginner.png";
import proImage from "../assets/icons/pro.png";
import businessImage from "../assets/icons/business.png";
import checkImage from "../assets/icons/check.png";

export function HomePage() {
  const { isAuthenticated, logout, user } = useAuth();

  const limits = user?.eventFiltersInfo;
  const used = limits?.usedCompanyCount ?? 0;
  const total = limits?.companyLimit ?? 0;

  return (
    <div className={styles.container}>
      {/* HEADER */}
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
            limits ? (
              <div className={styles.userInfoContainer}>
                <div className={styles.limitsBlockWrapper}>
                  <div className={styles.limitsBlock}>
                    <span className={styles.limitLabel}>
                      Использовано компаний
                    </span>
                    <span className={styles.limitValueUsed}>{used}</span>
                  </div>

                  <div className={styles.limitsBlock}>
                    <span className={styles.limitLabel}>
                      Лимит по компаниям
                    </span>
                    <span className={styles.limitValueTotal}>{total}</span>
                  </div>
                </div>

                <div>
                  <div className={styles.userRow}>
                    {/* Имя */}
                    <span className={styles.userName}>Иванов И.</span>

                    {/* Аватарка */}
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
              <span className={styles.loadingLimits}>Загрузка лимитов...</span>
            )
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

      {/* MAIN */}
      <main className={styles.main}>
        <div className={styles.mainContent}>
          <section className={styles.heroSection}>
            <h1 className={styles.mainTitle}>
              Сервис по поиску публикаций <br /> о компании <br /> по его ИНН
            </h1>
            <p className={styles.mainText}>
              Комплексный анализ публикаций, получение данных <br /> в формате
              PDF на электронную почту.
            </p>

            {/* Кнопка: видна только авторизованным */}
            {isAuthenticated ? (
              <Link to="/search" className={styles.btnRequest}>
                Запросить данные
              </Link>
            ) : null}
          </section>
          <img
            src={mainImage}
            alt="Картинка сервиса по поиску публикаций"
            className={styles.mainImage}
            loading="lazy"
          />
        </div>

        {/* Карусель: Почему именно мы */}
        <WhyWeCarousel cards={WHY_WE_CARDS} />

        <div>
          <img
            src={secondaryImage}
            alt="Картинка сервиса по поиску публикаций"
            className={styles.secondaryImage}
            loading="lazy"
          />
        </div>
        <section className={styles.planes}>
          <h2 className={styles.planesTitle}>Наши тарифы</h2>
          <div className={styles.planesWrapper}>
            <TariffCard
              title="Beginner"
              iconSrc={beginnerImage}
              description="Для небольшого исследования"
              price={799}
              oldPrice={1200}
              fulldescription={
                <>
                  <div className={styles.fulldescriptionWrapper}>
                    <p className={styles.priceDeccription}>
                      или 150 ₽/мес. при рассрочке на 24 мес.
                    </p>
                    <div className={styles.featuresListWrapper}>
                      <h4 className={styles.featuresListTitle}>
                        В тариф входит:
                      </h4>
                      <ul className={styles.featuresList}>
                        <li className={styles.featureItem}>
                          <img
                            src={checkImage}
                            alt=""
                            className={styles.checkIcon}
                            aria-hidden="true"
                          />
                          <span>Безлимитная история запросов</span>
                        </li>
                        <li className={styles.featureItem}>
                          <img
                            src={checkImage}
                            alt=""
                            className={styles.checkIcon}
                            aria-hidden="true"
                          />
                          <span>Безопасная сделка</span>
                        </li>
                        <li className={styles.featureItem}>
                          <img
                            src={checkImage}
                            alt=""
                            className={styles.checkIcon}
                            aria-hidden="true"
                          />
                          <span>Поддержка 24/7</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </>
              }
              ctaText="Подробнее"
              onSelect={() => console.log("Выбрать Beginner")}
              colorTarrif="#FFB64F"
            />
            <TariffCard
              title="Pro"
              iconSrc={proImage}
              description="Для HR и фрилансеров"
              price={1299}
              oldPrice={2600} // зачёркнутая цена
              fulldescription={
                <>
                  <div className={styles.fulldescriptionWrapper}>
                    <p className={styles.priceDeccription}>
                      или 279 ₽/мес. при рассрочке на 24 мес.
                    </p>
                    <div className={styles.featuresListWrapper}>
                      <h4 className={styles.featuresListTitle}>
                        В тариф входит:
                      </h4>
                      <ul className={styles.featuresList}>
                        <li className={styles.featureItem}>
                          <img
                            src={checkImage}
                            alt=""
                            className={styles.checkIcon}
                            aria-hidden="true"
                          />
                          <span>Все пункты тарифа Beginner</span>
                        </li>
                        <li className={styles.featureItem}>
                          <img
                            src={checkImage}
                            alt=""
                            className={styles.checkIcon}
                            aria-hidden="true"
                          />
                          <span>Экспорт истории</span>
                        </li>
                        <li className={styles.featureItem}>
                          <img
                            src={checkImage}
                            alt=""
                            className={styles.checkIcon}
                            aria-hidden="true"
                          />
                          <span>Рекомендации по приоритетам</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </>
              }
              ctaText="Подробнее"
              onSelect={() => console.log("Выбрать Beginner")}
              colorTarrif="#7CE3E1"
            />
            <TariffCard
              title="Business"
              iconSrc={businessImage}
              description="Для корпоративных клиентов"
              price={2379}
              oldPrice={3700}
              fulldescription={
                <>
                  <div className={styles.fulldescriptionWrapper}>
                    <p className={styles.priceDeccription}>
                      или 342 ₽/мес. при рассрочке на 24 мес.
                    </p>
                    <div className={styles.featuresListWrapper}>
                      <h4 className={styles.featuresListTitle}>
                        В тариф входит:
                      </h4>
                      <ul className={styles.featuresList}>
                        <li className={styles.featureItem}>
                          <img
                            src={checkImage}
                            alt=""
                            className={styles.checkIcon}
                            aria-hidden="true"
                          />
                          <span>Все пункты тарифа Pro</span>
                        </li>
                        <li className={styles.featureItem}>
                          <img
                            src={checkImage}
                            alt=""
                            className={styles.checkIcon}
                            aria-hidden="true"
                          />
                          <span>Безлимитное количество запросов</span>
                        </li>
                        <li className={styles.featureItem}>
                          <img
                            src={checkImage}
                            alt=""
                            className={styles.checkIcon}
                            aria-hidden="true"
                          />
                          <span>Приоритетная поддержка</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </>
              }
              ctaText="Подробнее"
              onSelect={() => console.log("Выбрать Business")}
              colorTarrif="#000000"
              colorTitle="#f5f5f5"
            />
          </div>
        </section>
      </main>

      {/* Футер */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.logoWrapper}>
            <img
              src={logoImgFooter}
              alt="Логотип Scan.Pub"
              className={styles.logoImage}
              loading="lazy"
            />
          </div>
          <div className={styles.footerText}>
            <p>
              г. Москва, Цветной б-р, 40
              <br />
              +7 495 771 21 11
              <br />
              info@skan.ru
            </p>
            <p className={styles.copyright}>Copyright. 2022</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
