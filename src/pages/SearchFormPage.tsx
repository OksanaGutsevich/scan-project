import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "../api/client";
import type { SearchPayload, SearchResponse } from "../types";

export function SearchFormPage() {
  const [inn, setInn] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Фильтры из предыдущего шага
  const [onlyMainRole, setOnlyMainRole] = useState(true);
  const [onlyWithRiskFactors, setOnlyWithRiskFactors] = useState(false);
  const [tonality, setTonality] = useState<"any" | "negative" | "positive">(
    "any",
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();

  const handleSearch = async () => {
    if (!inn.trim()) {
      setError("Укажите ИНН");
      return;
    }

    setLoading(true);
    setError(null);

    // Формируем целевой объект СТРОГО по контракту проекта:
    // type: 'company', inn: значение, остальные поля не передаём (undefined)
    const targetEntity = {
      type: "company" as const, // Гарантируем тип 'company', а не просто string
      inn: inn,
      // sparkId, entityId, inBusinessNews, maxFullness — не добавляем,
      // так как в рамках проекта они должны быть null/не использоваться.
      // Axios не отправит undefined поля в JSON.
    };

    const payload: SearchPayload = {
      issueDateInterval: {
        startDate: fromDate || new Date().toISOString(),
        endDate: toDate || new Date().toISOString(),
      },
      searchContext: {
        targetSearchEntitiesContext: {
          targetSearchEntities: [targetEntity], // Всегда массив из 1 элемента
          onlyMainRole,
          onlyWithRiskFactors,
          tonality,
          riskFactors: { and: [], or: [], not: [] },
          themes: { and: [], or: [], not: [] },
        },
        searchEntitiesFilter: {
          and: [{ type: "company" }], // Приводим к lowercase, если бэкенд ожидает так
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

    try {
      const res = await apiClient.post<SearchResponse>(
        "/api/v1/objectsearch",
        payload,
      );

      // Сохраняем параметры в URL
      setSearchParams({
        inn,
        tonality,
        onlyMainRole: String(onlyMainRole),
        onlyWithRiskFactors: String(onlyWithRiskFactors),
      });
      navigate("/results?inn=" + encodeURIComponent(inn));
    } catch (err: any) {
      let msg = "Ошибка поиска. Проверьте параметры.";
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: "1.5rem", fontSize: "20px" }}>
        Поиск публикаций по ИНН
      </h1>

      {error && (
        <div
          style={{
            color: "red",
            marginBottom: "1rem",
            padding: "0.5rem",
            background: "#fff3f3",
            borderRadius: "4px",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.3rem",
              fontWeight: 600,
            }}
          >
            ИНН компании
          </label>
          <input
            type="text"
            placeholder="10 или 12 цифр"
            value={inn}
            onChange={(e) => setInn(e.target.value.replace(/\D/g, ""))}
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.3rem",
              fontWeight: 600,
            }}
          >
            С даты
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.3rem",
              fontWeight: 600,
            }}
          >
            По дату
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
      </div>

      <div
        style={{
          background: "#f9f9f9",
          padding: "1rem",
          borderRadius: "6px",
          marginBottom: "1.5rem",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "16px", marginBottom: "0.75rem" }}>
          Фильтры контекста упоминания
        </h3>

        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          <div>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "0.4rem",
              }}
            >
              Главная роль
            </label>
            <label>
              <input
                type="checkbox"
                checked={onlyMainRole}
                onChange={(e) => setOnlyMainRole(e.target.checked)}
              />
              Только главная роль
            </label>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "0.4rem",
              }}
            >
              Риск-факторы
            </label>
            <label>
              <input
                type="checkbox"
                checked={onlyWithRiskFactors}
                onChange={(e) => setOnlyWithRiskFactors(e.target.checked)}
              />
              Только с риск-факторами
            </label>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "0.4rem",
              }}
            >
              Тональность
            </label>
            <select
              value={tonality}
              onChange={(e) => setTonality(e.target.value as TonalityOption)}
              style={{ padding: "6px 8px" }}
            >
              <option value="any">Любая (any)</option>
              <option value="negative">Негативная (negative)</option>
              <option value="positive">Позитивная (positive)</option>
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={handleSearch}
        disabled={loading}
        className="blue-button"
        style={{ padding: "12px 24px", fontSize: "16px" }}
      >
        {loading ? "Поиск..." : "Найти публикации"}
      </button>
    </div>
  );
}

export default SearchFormPage;
