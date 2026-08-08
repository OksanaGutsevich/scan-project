// src/components/PublicationCard.tsx
import type { ScanDoc, DocumentAttributes } from "../types";
import styles from "./PublicationCard.module.css";

const stripXmlTags = (markup: string): string => {
  if (!markup) return "";
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = markup;
  const decoded = tempDiv.textContent ?? "";
  return decoded.replace(/<[^>]*>/g, "").trim();
};

function extractImageUrl(markup: string): string | null {
  if (!markup) return null;

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = markup;
  const decoded = tempDiv.textContent ?? "";

  // Если после декодирования остались теги — парсим как HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(decoded, "text/html");
  const img = doc.querySelector("img");

  return img?.getAttribute("src") ?? null;
}

interface PublicationCardProps {
  doc: ScanDoc;
}

// Вспомогательная функция: возвращает человекопонятный тип публикации
const getPublicationTypeLabel = (attrs?: DocumentAttributes): string | null => {
  if (!attrs) return null;

  if (attrs.isTechNews) return "Техническая новость";
  if (attrs.isAnnouncement) return "Анонс";
  if (attrs.isDigest) return "Сводка новостей";

  return null; // если ничего не подошло
};

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
  const previewText = cleanText.substring(0, 300);

  const wordCount =
    typeof doc.attributes?.wordCount === "number"
      ? doc.attributes.wordCount
      : 0;

  // Получаем читаемую метку типа публикации
  const publicationTypeLabel = getPublicationTypeLabel(doc.attributes);

  return (
    <article className={styles.publicationCard}>
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

      <h3 className={styles.title}>{doc.title?.text ?? "Без заголовка"}</h3>

      {/* Бейдж типа публикации (если есть) */}
      {publicationTypeLabel && (
        <div className={styles.typeBadge}>{publicationTypeLabel}</div>
      )}

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

      <p className={styles.preview}>
        {previewText}
        {cleanText.length > 150 ? "…" : ""}
      </p>

      <div className={styles.footer}>
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.readMoreButton}
        >
          Читать в источнике
        </a>

        <span className={styles.meta}>{wordCount} слов</span>
      </div>
    </article>
  );
};
