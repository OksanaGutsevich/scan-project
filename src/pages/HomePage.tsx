// src/pages/HomePage.tsx
import { Link } from "react-router-dom";
import { WhyWeCarousel } from "../components/WhyWeCarousel";
import { WHY_WE_CARDS } from "../mock/mockData";
import styles from "./HomePage.module.css";
import mainImage from "../assets/icons/main.png";
import secondaryImage from "../assets/icons/secondary.png";
import { TariffCard } from "../components/TariffCard";
import beginnerImage from "../assets/icons/beginner.png";
import proImage from "../assets/icons/pro.png";
import businessImage from "../assets/icons/business.png";
import checkImage from "../assets/icons/check.png";
import { useAuth } from "../hooks/useAuth";
import { Header } from "../components/Header/Header";
import { Footer } from "../components/Footer/Footer";

export function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className={styles.container}>
      {/* Header вынесен отдельно*/}
      <Header />

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
    </div>
  );
}

export default HomePage;
