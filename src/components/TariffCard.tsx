import styles from "./TariffCard.module.css";
import React from "react";

interface TariffCardProps {
  title: string;
  description: string;
  price: number;
  oldPrice?: number;
  fulldescription: React.ReactNode;
  isCurrent?: boolean;
  ctaText?: string;
  onSelect?: () => void;
  iconSrc?: string;
  colorTarrif?: string;
  colorTitle?: string;
}

export function TariffCard({
  title,
  description,
  price,
  oldPrice,
  fulldescription,
  isCurrent = false,
  ctaText = "Выбрать",
  onSelect,
  iconSrc,
  colorTarrif = "#f5f5f5",
  colorTitle = "#000000",
}: TariffCardProps) {
  return (
    <div className={styles.card}>
      {isCurrent && <span className={styles.badgeCurrent}>Текущий тариф</span>}
      <div
        className={styles.tariffTitleWrapper}
        style={{ backgroundColor: colorTarrif }}
      >
        <div className={styles.tariffTitle} style={{ color: colorTitle }}>
          <h3 className={styles.title} style={{ color: colorTitle }}>
            {title}
          </h3>
          <p className={styles.description}>{description}</p>
        </div>
        <div className={styles.tariffIconWrapper}>
          {iconSrc && (
            <img
              src={iconSrc}
              alt=""
              className={styles.iconImg}
              loading="lazy"
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      <div className={styles.priceBlock}>
        <span className={styles.newPrice}>
          {price.toLocaleString("ru-RU")} ₽
        </span>
        {oldPrice && (
          <span className={styles.oldPrice}>
            {oldPrice.toLocaleString("ru-RU")} ₽
          </span>
        )}
      </div>

      <div className={styles.fulldescription}>{fulldescription}</div>

      <button
        className={isCurrent ? styles.btnCurrent : styles.btn}
        onClick={onSelect}
        disabled={isCurrent}
      >
        {isCurrent ? "Активен" : ctaText}
      </button>
    </div>
  );
}
