import { useEffect, useRef, useState } from "react";
import type { WhyWeCard } from "../types";
import styles from "./WhyWeCarousel.module.css";

interface WhyWeCarouselProps {
  cards: WhyWeCard[];
}

export const WhyWeCarousel = ({ cards }: WhyWeCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const total = cards.length;
  if (total === 0) return null;

  const prev = () => {
    setCurrentIndex((i) => (i === 0 ? total - 1 : i - 1));
  };

  const next = () => {
    setCurrentIndex((i) => (i === total - 1 ? 0 : i + 1));
  };

  const gap = 32;
  const offset = currentIndex * (cardWidth + gap);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const card = containerRef.current.querySelector(`.${styles.card}`);
        if (card) {
          const rect = card.getBoundingClientRect();
          setCardWidth(rect.width);
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className={styles.sectionCarousel}>
      <div className={styles.container}>
        <h2 className={styles.title}>Почему именно мы</h2>

        <div className={styles.carouselWrapper}>
          {/* wrapper: overflow + position:relative для кнопок */}
          <div className={styles.wrapper}>
            <div
              ref={containerRef}
              className={styles.cardsContainer}
              style={{
                transform: `translateX(-${offset}px)`,
                transition:
                  currentIndex === 0 || currentIndex === total - 1
                    ? "none"
                    : "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
              }}
            >
              {cards.map((card, index) => {
                // Если карточка сейчас первая (после сдвига), добавляем класс
                const isFirst = index === currentIndex;

                return (
                  <div
                    key={card.id}
                    className={`${styles.card} ${isFirst ? styles.isFirst : ""}`}
                  >
                    <img
                      src={card.icon}
                      alt={card.title}
                      className={styles.cardIcon}
                      loading="lazy"
                    />
                    <h3 className={styles.cardTitle}>{card.title}</h3>
                  </div>
                );
              })}
            </div>

            {/* кнопки внутри wrapper, но снаружи cardsContainer */}
            <button
              type="button"
              onClick={prev}
              className={`${styles.navButton} ${styles.prev}`}
              aria-label="Предыдущая карточка"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={next}
              className={`${styles.navButton} ${styles.next}`}
              aria-label="Следующая карточка"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
