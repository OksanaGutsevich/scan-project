import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import type { WhyWeCard } from "../types";
import styles from "./WhyWeCarousel.module.css";

// 1. Создаём тип для пропсов
interface WhyWeCarouselProps {
  cards: WhyWeCard[];
}

export const WhyWeCarousel = ({ cards }: WhyWeCarouselProps) => {
  const total = cards.length;
  if (total === 0) return null;

  const breakpoints = {
    640: {
      slidesPerView: 1,
      spaceBetween: 24,
    },
    1024: {
      slidesPerView: 3,
      spaceBetween: 36,
    },
  };

  return (
    <section className={styles.sectionCarousel}>
      <div className={styles.container}>
        <h2 className={styles.title}>Почему именно мы</h2>

        <div className={styles.carouselWrapper}>
          <Swiper
            modules={[Navigation]}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={breakpoints}
            navigation={{
              nextEl: `.${styles.next}`,
              prevEl: `.${styles.prev}`,
            }}
            loop={false}
            grabCursor={true}
            className={styles.swiperRoot}
          >
            {cards.map((card) => (
              <SwiperSlide key={card.id} className={styles.slide}>
                <div className={styles.card}>
                  <img
                    src={card.icon}
                    alt={card.title}
                    className={styles.cardIcon}
                    loading="lazy"
                  />
                  <h3 className={styles.cardTitle}>{card.title}</h3>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <button
            type="button"
            className={`${styles.navButton} ${styles.prev}`}
            aria-label="Предыдущая карточка"
          >
            ‹
          </button>
          <button
            type="button"
            className={`${styles.navButton} ${styles.next}`}
            aria-label="Следующая карточка"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
};
