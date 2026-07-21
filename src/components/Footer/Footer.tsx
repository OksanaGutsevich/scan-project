import styles from "./Footer.module.css";
import logoImgFooter from "../../assets/icons/logofooter.png";

export function Footer() {
  return (
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
  );
}
