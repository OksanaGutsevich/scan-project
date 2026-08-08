// src/components/LoadingSpinner.tsx
import type { ReactElement } from "react";
import styles from "./LoadingSpinner.module.css";

interface LoadingSpinnerProps {
  transparent?: boolean;
}

export function LoadingSpinner({
  transparent,
}: LoadingSpinnerProps = {}): ReactElement {
  return (
    <div
      className={
        transparent ? styles.spinnerRingTransparent : styles.spinnerRing
      }
    >
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className={styles.dot}
          style={{
            animationDelay: `${-1.2 + i * 0.2}s`,
            transform: `rotate(${i * 30}deg) translateX(25px)`,
          }}
        />
      ))}
    </div>
  );
}
