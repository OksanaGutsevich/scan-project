// src/components/PublicationCard.tsx
import type { SearchResultItem, ScanDoc } from "../types";
import { Link } from "react-router-dom";

interface PublicationCardProps {
  item: SearchResultItem;
  // Если у тебя уже есть полные данные (например, из кэша) — можно передавать scanDoc
  scanDoc?: ScanDoc | null;
}

export const PublicationCard = ({ item, scanDoc }: PublicationCardProps) => {
  const title = scanDoc?.title.text || "Без заголовка";
  const sourceName = scanDoc?.source.name || "Неизвестный источник";
  const issueDate = scanDoc?.issueDate
    ? new Date(scanDoc.issueDate).toLocaleDateString("ru-RU")
    : "Дата не указана";

  return (
    <Link
      to={`/publication/${item.encodedId}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div
        style={{
          border: "1px solid #ccc",
          padding: "1rem",
          borderRadius: "6px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          transition: "transform 0.2s, box-shadow 0.2s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = "translateY(-4px)";
          el.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = "";
          el.style.boxShadow = "";
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "18px",
            marginBottom: "0.5rem",
            lineHeight: 1.3,
          }}
        >
          {title}
        </h3>

        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "0.5rem",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              padding: "2px 6px",
              background: "#e0e0e0",
              borderRadius: "4px",
              color: "#333",
            }}
          >
            {sourceName}
          </span>
          <span
            style={{
              fontSize: "12px",
              color: "#666",
            }}
          >
            {issueDate}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "0.5rem",
            paddingTop: "0.5rem",
            borderTop: "1px solid #eee",
          }}
        >
          <div>
            <small style={{ display: "block", color: "#888" }}>Влияние</small>
            <strong style={{ fontSize: "14px" }}>{item.influence}</strong>
          </div>
          <div>
            <small style={{ display: "block", color: "#888" }}>Похожие</small>
            <strong style={{ fontSize: "14px" }}>{item.similarCount}</strong>
          </div>
        </div>
      </div>
    </Link>
  );
};
