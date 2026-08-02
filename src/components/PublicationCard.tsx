// src/components/PublicationCard.tsx
import type { ScanDoc } from "../types";
import styles from "./PublicationCard.module.css";

// Утилита: декодируем HTML-сущности и вырезаем XML-теги
const stripXmlTags = (markup: string): string => {
  if (!markup) return "";

  // 1. Декодируем сущности через DOM (безопасно для браузера)
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = markup;
  const decoded = tempDiv.textContent ?? "";

  // 2. Удаляем все теги
  return decoded.replace(/<[^>]*>/g, "").trim();
};

// Вспомогательная функция: вытаскивает src из первого img (учитывает экранированные &lt;img)
function extractImageUrl(markup: string): string | null {
  // Сначала пробуем найти экранированный вариант (частый случай от API)
  const imgMatch = markup.match(/&lt;img[^&]*src=["']([^"']+)["']/i);
  if (imgMatch) {
    return imgMatch[1];
  }

  // Если не нашли, пробуем обычный вариант (на случай, если API вдруг отдаст без экранирования)
  const fallbackMatch = markup.match(/<img[^>]+src=["']([^"']+)["']/i);
  return fallbackMatch ? fallbackMatch[1] : null;
}

interface PublicationCardProps {
  doc: ScanDoc;
}

export const PublicationCard = ({ doc }: PublicationCardProps) => {
  const dateStr = doc.issueDate
    ? new Date(doc.issueDate).toLocaleDateString("ru-RU")
    : "—";

  const sourceName = doc.source?.name ?? "Неизвестный источник";
  const sourceUrl = doc.url ?? "#";

  const imageUrl = doc.content?.markup
    ? extractImageUrl(doc.content.markup)
    : null;

  const rawText = doc.content?.markup ?? "";
  const cleanText = stripXmlTags(rawText);
  const previewText = cleanText.substring(0, 150);

  const wordCount =
    typeof doc.attributes?.wordCount === "number"
      ? doc.attributes.wordCount
      : 0;

  return (
    <article className={styles.publicationCard}>
      {/* Первая строка: дата и ссылка на источник */}
      <div className={styles.header}>
        <span className={styles.date}>{dateStr}</span>
        <span className={styles.separator}>•</span>
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.sourceLink}
        >
          {sourceName}
        </a>
      </div>

      {/* Название публикации */}
      <h3 className={styles.title}>{doc.title?.text ?? "Без заголовка"}</h3>

      {/* Картинка (если есть) */}
      {imageUrl && (
        <div className={styles.imageWrapper}>
          <img
            src={imageUrl}
            alt="Иллюстрация к публикации"
            className={styles.image}
            loading="lazy"
          />
        </div>
      )}

      {/* Основная часть публикации (до 150 символов, остальное скрыто) */}
      <p className={styles.preview}>
        {previewText}
        {cleanText.length > 150 ? "…" : ""}
      </p>

      <div className={styles.footer}>
        {/* Количество слов */}
        <span className={styles.meta}>{wordCount} слов</span>

        {/* Кнопка «Читать в источнике» */}
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.readMoreButton}
        >
          Читать в источнике
        </a>
      </div>
    </article>
  );
};
