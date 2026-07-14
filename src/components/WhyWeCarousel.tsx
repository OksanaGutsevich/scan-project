import { useState } from "react";
import type { WhyWeCard } from "../types";

interface WhyWeCarouselProps {
  cards: WhyWeCard[];
}

export const WhyWeCarousel = ({ cards }: WhyWeCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const total = cards.length;
  if (total === 0) return null;

  const prev = () => setCurrentIndex((i) => (i === 0 ? total - 1 : i - 1));
  const next = () => setCurrentIndex((i) => (i === total - 1 ? 0 : i + 1));

  const card = cards[currentIndex];

  return (
    <section style={{ padding: "3rem 0", background: "#fff" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h2
          style={{
            textAlign: "center",
            marginBottom: "2rem",
            fontSize: "24px",
          }}
        >
          Почему именно мы
        </h2>

        <div
          style={{
            position: "relative",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          {/* Карточка */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "32px", marginBottom: "1rem" }}>
              {card.icon}
            </div>
            <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "18px" }}>
              {card.title}
            </h3>
            <p style={{ color: "#555", lineHeight: 1.5 }}>{card.description}</p>
          </div>

          {/* Стрелки */}
          <button
            type="button"
            onClick={prev}
            style={{
              position: "absolute",
              top: "50%",
              left: "16px",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              padding: "8px",
              zIndex: 10,
              userSelect: "none",
            }}
          >
            ‹
          </button>

          <button
            type="button"
            onClick={next}
            style={{
              position: "absolute",
              top: "50%",
              right: "16px",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              padding: "8px",
              zIndex: 10,
              userSelect: "none",
            }}
          >
            ›
          </button>

          {/* Индикаторы (точки) */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "6px",
              marginTop: "1.5rem",
            }}
          >
            {cards.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIndex(i)}
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  border: "none",
                  background: i === currentIndex ? "#007bff" : "#ddd",
                  padding: 0,
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
