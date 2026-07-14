import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import apiClient from "../api/client";
import type { SearchResponse, EventFiltersInfo } from "../types";

function ResultsPage() {
  const [searchParams] = useSearchParams();
  const inn = searchParams.get("inn");

  const [results, setResults] = useState<SearchResponse | null>(null);
  const [limits, setLimits] = useState<EventFiltersInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!inn) {
      setLoading(false);
      return;
    }

    // Формируем payload строго по контракту: targetSearchEntities — всегда массив из 1 объекта
    const payload = {
      issueDateInterval: {
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
      },
      searchContext: {
        targetSearchEntitiesContext: {
          // ВАЖНО: всегда ровно один объект, как указано в требованиях проекта
          targetSearchEntities: [{ type: "Company" }],
          onlyMainRole: true,
          tonality: "Any",
          onlyWithRiskFactors: false,
          riskFactors: { and: [], or: [], not: [] },
          themes: { and: [], or: [], not: [] },
        },
        searchEntitiesFilter: {
          and: [{ type: "Company" }],
          or: [],
          not: [],
        },
        locationsFilter: { and: [], or: [], not: [] },
        themesFilter: { and: [], or: [], not: [] },
      },
      searchArea: {
        includedSources: [],
        excludedSources: [],
        includedSourceGroups: [],
        excludedSourceGroups: [],
        includedDistributionMethods: [],
        excludedDistributionMethods: [],
      },
      attributeFilters: {
        excludeTechNews: true,
        excludeAnnouncements: true,
        excludeDigests: true,
      },
      similarMode: "None",
      intervalType: "Day",
      limit: 50,
      sortType: "None",
      sortDirectionType: "Desc",
    };

    setLoading(true);
    setError(null);

    // Параллельно грузим лимиты и результаты поиска
    Promise.all([
      apiClient
        .get<{ eventFiltersInfo: EventFiltersInfo }>("/api/v1/account/info")
        .then((res) => res.data.eventFiltersInfo),
      apiClient.post<SearchResponse>("/api/v1/objectsearch", payload),
    ])
      .then(([limitsData, searchData]) => {
        setLimits(limitsData);
        setResults(searchData);
        setLoading(false);
      })
      .catch((err) => {
        let msg = "Не удалось загрузить данные.";
        if (err.response?.data?.message) {
          msg = err.response.data.message;
        } else if (err.message) {
          msg = err.message;
        }
        setError(msg);
        setLoading(false);
      });
  }, [inn]);

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

  if (error) {
    return (
      <div className="container">
        <h1 style={{ marginBottom: "1rem", fontSize: "20px" }}>
          Результаты поиска
        </h1>
        <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
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

  return (
    <div className="container">
      <h1 style={{ marginBottom: "1.5rem", fontSize: "20px" }}>
        Результаты поиска по ИНН {inn}
      </h1>

      {/* Блок лимитов (если данные пришли) */}
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
              <div
                key={item.encodedId}
                style={{
                  border: "1px solid #ccc",
                  padding: "1rem",
                  borderRadius: "6px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    marginBottom: "0.5rem",
                  }}
                >
                  Публикация: {item.encodedId.substring(0, 30)}…
                </h3>
                <p style={{ margin: 0, color: "#555" }}>
                  Влияние: <strong>{item.influence}</strong>
                </p>
                <p style={{ margin: "0.5rem 0 0", color: "#555" }}>
                  Похожие публикации: <strong>{item.similarCount}</strong>
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ResultsPage;
