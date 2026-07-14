// src/pages/HomePage.tsx
import { Link } from "react-router-dom";
import { WhyWeCarousel } from "../components/WhyWeCarousel";
import { WHY_WE_CARDS } from "../mock/mockData";
import { useAuth } from "../context/AuthContext";

export function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div
      className="container"
      style={{ maxWidth: "960px", margin: "0 auto", padding: "1rem 16px" }}
    >
      {/* Главный экран */}
      <section style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
        <h1 style={{ fontSize: "36px", lineHeight: 1.2, marginBottom: "1rem" }}>
          Поиск публикаций о компании по ИНН
        </h1>
        <p style={{ fontSize: "18px", color: "#444", maxWidth: "600px" }}>
          Анализируйте упоминания компании в СМИ и интернете: находите новости,
          статьи и обзоры, оценивайте тональность и отслеживайте динамику.
        </p>

        {/* Кнопка: видна только авторизованным */}
        {isAuthenticated ? (
          <Link
            to="/search"
            style={{
              marginTop: "1.5rem",
              display: "inline-block",
              padding: "12px 24px",
              backgroundColor: "#007bff",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "6px",
              fontWeight: 500,
            }}
          >
            Запросить данные
          </Link>
        ) : (
          <p style={{ marginTop: "1.5rem", color: "#666" }}>
            Чтобы начать поиск,{" "}
            <Link to="/auth" style={{ color: "#007bff" }}>
              войдите в систему
            </Link>
            .
          </p>
        )}
      </section>

      {/* Карусель: Почему именно мы */}
      <WhyWeCarousel cards={WHY_WE_CARDS} />

      {/* Футер */}
      <footer
        style={{
          marginTop: "3rem",
          paddingTop: "2rem",
          borderTop: "1px solid #eee",
          textAlign: "center",
          color: "#888",
          fontSize: "14px",
        }}
      >
        &copy; 2024 Сервис поиска публикаций. Все права защищены.
      </footer>
    </div>
  );
}

export default HomePage;
