// src/pages/ResultsPage.tsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
// apiClient пока не нужен — используем моки для этапа вёрстки
// import apiClient from '../api/client';

import type {
  SearchResponse,
  EventFiltersInfo,
  AnalyticsResponse,
} from "../types";
import { SearchStats } from "../components/SearchStats";
import { PublicationCard } from "../components/PublicationCard";

// Импортируем моковые данные из отдельного файла
import { MOCK_SEARCH_RESPONSE, MOCK_ANALYTICS } from "../mock/mockData";

// Моковые лимиты (можно тоже вынести в mockData, если нужно)
const MOCK_LIMITS: EventFiltersInfo = {
  usedCompanyCount: 3,
  companyLimit: 10,
};

function ResultsPage() {
  const [searchParams] = useSearchParams();
  // Если в URL нет ИНН — подставим тестовый, чтобы страница не была пустой при вёрстке
  const inn = searchParams.get("inn") || "7701234567";

  const [results, setResults] = useState<SearchResponse | null>(null);
  const [limits, setLimits] = useState<EventFiltersInfo | null>(null);
  const [stats, setStats] = useState<AnalyticsResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!inn) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // --- ЭТАП ВЁРСТКИ: используем моки из src/mocks/mockData.ts ---
    setTimeout(() => {
      setLimits(MOCK_LIMITS);
      setResults(MOCK_SEARCH_RESPONSE);
      setStats(MOCK_ANALYTICS);
      setLoading(false);
    }, 400); // имитация небольшой задержки сети

    /*
    // ОРИГИНАЛЬНАЯ ЛОГИКА С API (раскомментировать на этапе подключения бэкенда):
    const payload = {
      issueDateInterval: {
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
      },
      searchContext: {
        targetSearchEntitiesContext: {
          targetSearchEntities: [{ type: 'company', inn }],
          onlyMainRole: true,
          onlyWithRiskFactors: false,
          tonality: 'any',
          riskFactors: { and: [], or: [], not: [] },
          themes: { and: [], or: [], not: [] },
        },
        searchEntitiesFilter: {
          and: [{ type: 'company' }],
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
      similarMode: 'None',
      intervalType: 'Day',
      limit: 50,
      sortType: 'None',
      sortDirectionType: 'Desc',
    };

    Promise.all([
      apiClient
        .get<{ eventFiltersInfo: EventFiltersInfo }>('/api/v1/account/info')
        .then((res) => res.data.eventFiltersInfo),
      apiClient.post<SearchResponse>('/api/v1/objectsearch', payload),
      apiClient.get<AnalyticsResponse>('/api/v1/analytics').catch(() => null),
    ])
      .then(([limitsData, searchData, statsData]) => {
        setLimits(limitsData);
        setResults(searchData);
        setStats(statsData);
        setLoading(false);
      })
      .catch((err) => {
        let msg = 'Не удалось загрузить данные.';
        if (err.response?.data?.message) {
          msg = err.response.data.message;
        } else if (err.message) {
          msg = err.message;
        }
        setError(msg);
        setLoading(false);
      });
    */
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

      {/* Блок лимитов */}
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

      {/* Блок статистики */}
      {stats && <SearchStats points={stats.points} />}

      {/* Список публикаций через PublicationCard */}
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
