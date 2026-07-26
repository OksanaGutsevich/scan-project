// src/pages/ResultsPage.tsx
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSearchResults } from "../hooks/useSearchResults";
import { SearchStats } from "../components/SearchStats";
import { PublicationCard } from "../components/PublicationCard";

function ResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const inn = searchParams.get("inn") || "7701234567";

  const { results, limits, stats, histograms, loading, error } =
    useSearchResults(inn);

  // Обработка 401: перенаправление из компонента (разрешено здесь)
  if (error === "UNAUTHORIZED") {
    navigate("/auth", { replace: true });
    return null; // ничего не рендерим, пользователь уже уходит
  }

  if (loading) {
    return (
      <div
        className="container"
        style={{ textAlign: "center", marginTop: "3rem" }}
      >
        <p>Загрузка данных...</p>
      </div>
    );
  }

  if (!loading && error) {
    return (
      <div className="container">
        <h1 style={{ marginBottom: "1rem", fontSize: "20px" }}>
          Результаты поиска
        </h1>
        <div style={{ color: "#d32f2f", marginBottom: "1rem" }}>{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="blue-button"
          style={{ padding: "8px 16px" }}
        >
          Повторить
        </button>
      </div>
    );
  }

  const getHistogramData = (type: "totalDocuments" | "riskFactors") => {
    if (!histograms?.data) return [];
    const item = histograms.data.find((h) => h.histogramType === type);
    return item?.data || [];
  };

  const totalDocs = getHistogramData("totalDocuments");
  const riskFactors = getHistogramData("riskFactors");

  return (
    <div className="container">
      <h1 style={{ marginBottom: "1.5rem", fontSize: "20px" }}>
        Результаты поиска по ИНН {inn}
      </h1>

      {limits && (
        <div
          style={{
            marginBottom: "2rem",
            padding: "1rem",
            border: "1px solid #ddd",
            borderRadius: "6px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "18px" }}>Лимиты мониторинга</h3>
          <p style={{ margin: "0.5rem 0" }}>
            Используется компаний: <strong>{limits.usedCompanyCount}</strong>
          </p>
          <p style={{ margin: 0 }}>
            Лимит по тарифу: <strong>{limits.companyLimit}</strong>
          </p>
        </div>
      )}

      {stats && <SearchStats points={stats.points} />}

      {totalDocs.length > 0 || riskFactors.length > 0 ? (
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ marginBottom: "0.75rem" }}>
            Динамика публикаций по месяцам
          </h3>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.9rem",
              marginBottom: "1rem",
            }}
          >
            <thead>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: "0.4rem" }}>
                  Дата
                </th>
                <th style={{ border: "1px solid #ccc", padding: "0.4rem" }}>
                  Всего публикаций
                </th>
                <th style={{ border: "1px solid #ccc", padding: "0.4rem" }}>
                  Риск‑факторы
                </th>
              </tr>
            </thead>
            <tbody>
              {totalDocs.map((point, idx) => {
                const riskPoint = riskFactors[idx] || {
                  date: point.date,
                  value: 0,
                };
                return (
                  <tr key={point.date}>
                    <td style={{ border: "1px solid #ccc", padding: "0.4rem" }}>
                      {new Date(point.date).toLocaleDateString("ru-RU", {
                        year: "numeric",
                        month: "long",
                      })}
                    </td>
                    <td
                      style={{
                        border: "1px solid #ccc",
                        padding: "0.4rem",
                        textAlign: "right",
                      }}
                    >
                      {point.value}
                    </td>
                    <td
                      style={{
                        border: "1px solid #ccc",
                        padding: "0.4rem",
                        textAlign: "right",
                        color: riskPoint.value > 0 ? "#d32f2f" : "inherit",
                      }}
                    >
                      {riskPoint.value}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ marginBottom: "2rem", color: "#888" }}>
          Нет данных для построения гистограммы.
        </div>
      )}

      {!results || results.items.length === 0 ? (
        <p>По заданным параметрам публикаций не найдено.</p>
      ) : (
        <>
          <p style={{ marginBottom: "1rem" }}>
            Найдено публикаций: <strong>{results.items.length}</strong>
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "1rem",
            }}
          >
            {results.items.map((item) => (
              <PublicationCard key={item.encodedId} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ResultsPage;
