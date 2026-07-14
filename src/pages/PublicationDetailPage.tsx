// src/pages/PublicationDetailPage.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
// apiClient пока не нужен — используем моки для этапа вёрстки
// import apiClient from '../api/client';

import type { ScanDoc } from "../types";
// Импортируем мок для детальной публикации
import { MOCK_SCANDOC } from "../mock/mockData";

function PublicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<ScanDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // --- ЭТАП ВЁРСТКИ: используем мок вместо API ---
    setTimeout(() => {
      // Если ID совпадает с моком — показываем его, иначе — тот же мок (для быстрой вёрстки)
      const mockDoc = id === "pub-001" ? MOCK_SCANDOC : MOCK_SCANDOC;
      setDoc(mockDoc);
      setLoading(false);
    }, 400); // имитация небольшой задержки сети

    /*
    // ОРИГИНАЛЬНАЯ ЛОГИКА С API (раскомментировать на этапе подключения бэкенда):
    apiClient
      .get<ScanDoc>(`/api/v1/publications/${id}`)
      .then((res) => {
        setDoc(res.data);
        setLoading(false);
      })
      .catch((err) => {
        let msg = 'Не удалось загрузить публикацию.';
        if (err.response?.data?.message) {
          msg = err.response.data.message;
        } else if (err.message) {
          msg = err.message;
        }
        setError(msg);
        setLoading(false);
      });
    */
  }, [id]);

  if (loading) {
    return (
      <div
        className="container"
        style={{ textAlign: "center", marginTop: "3rem" }}
      >
        <p>Загрузка публикации...</p>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="container">
        <h1 style={{ marginBottom: "1rem", fontSize: "20px" }}>Ошибка</h1>
        <div style={{ color: "red", marginBottom: "1rem" }}>
          {error || "Публикация не найдена"}
        </div>
        <Link
          to="/results"
          className="blue-button"
          style={{ padding: "8px 16px" }}
        >
          Вернуться к результатам
        </Link>
      </div>
    );
  }

  const wordCountBadge = doc.attributes.wordCount
    ? `${doc.attributes.wordCount} слов`
    : "—";

  const isTechNewsBadge = doc.attributes.isTechNews ? "Tech" : null;
  const isAnnouncementBadge = doc.attributes.isAnnouncement ? "Анонс" : null;
  const isDigestBadge = doc.attributes.isDigest ? "Дайджест" : null;

  const badges = [isTechNewsBadge, isAnnouncementBadge, isDigestBadge].filter(
    Boolean,
  );

  return (
    <div className="container" style={{ maxWidth: "900px" }}>
      <Link
        to="/results"
        style={{
          display: "inline-block",
          marginBottom: "1rem",
          color: "#007bff",
          textDecoration: "underline",
        }}
      >
        ← Назад к результатам
      </Link>

      <article>
        <header
          style={{
            marginBottom: "2rem",
            borderBottom: "1px solid #ddd",
            paddingBottom: "1rem",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "24px", lineHeight: 1.2 }}>
            {doc.title.text}
          </h1>

          <div
            style={{
              marginTop: "0.75rem",
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                padding: "3px 8px",
                background: "#f0f0f0",
                borderRadius: "16px",
                color: "#555",
              }}
            >
              {doc.source.name}
            </span>
            <span
              style={{
                fontSize: "13px",
                color: "#777",
              }}
            >
              {new Date(doc.issueDate).toLocaleString("ru-RU")}
            </span>

            {badges.length > 0 && (
              <div style={{ marginLeft: "auto" }}>
                {badges.map((b, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: "11px",
                      padding: "2px 6px",
                      background: "#ffeb3b",
                      color: "#333",
                      borderRadius: "4px",
                      marginRight: "4px",
                    }}
                  >
                    {b}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: "0.5rem", fontSize: "13px", color: "#666" }}>
            Автор: {doc.author.name || "Аноним"} • Язык: {doc.language}
          </div>
        </header>

        <section style={{ lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
          {/* Если нужно отображать XML-разметку как текст — оставляем markup. 
              Если нужен чистый текст — потребуется парсинг. */}
          {doc.content.markup}
        </section>

        {/* Блок атрибутов (опционально, можно свернуть) */}
        <aside
          style={{
            marginTop: "3rem",
            padding: "1rem",
            background: "#f9f9f9",
            border: "1px solid #eee",
            borderRadius: "6px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "16px", marginBottom: "0.75rem" }}>
            Атрибуты публикации
          </h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: "0.4rem" }}>
              <strong>Версия данных:</strong> {doc.version}
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              <strong>Schema version:</strong> {doc.schemaVersion}
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              <strong>Dedup cluster ID:</strong> {doc.dedupClusterId}
            </li>
            <li>
              <strong>Количество слов:</strong> {wordCountBadge}
            </li>
          </ul>
        </aside>
      </article>
    </div>
  );
}

export default PublicationDetailPage;
