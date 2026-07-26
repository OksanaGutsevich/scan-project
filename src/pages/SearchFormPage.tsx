// src/pages/SearchFormPage.tsx
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "../api/client";
import type {
  SearchPayload,
  SearchResponse,
  TonalityOption,
  TargetSearchEntity,
} from "../types";
import axios from "axios";

export function SearchFormPage() {
  const [inn, setInn] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [onlyMainRole, setOnlyMainRole] = useState(true);
  const [onlyWithRiskFactors, setOnlyWithRiskFactors] = useState(false);
  const [tonality, setTonality] = useState<TonalityOption>("any");

  // ✅ Новое поле: лимит выдачи
  const [limit, setLimit] = useState<string>("50");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();

  // Нормализация даты: только YYYY-MM-DD
  const normalizeDate = (dateStr?: string): string => {
    if (!dateStr) {
      return new Date().toISOString().split("T")[0];
    }
    const clean = dateStr.split("T")[0].split(" ")[0];
    return /^\d{4}-\d{2}-\d{2}$/.test(clean)
      ? clean
      : new Date().toISOString().split("T")[0];
  };

  const handleSearch = async () => {
    const innClean = inn.replace(/\D/g, "");

    // Валидация ИНН
    if (!innClean) {
      setError("Укажите ИНН");
      return;
    }

    // Валидация лимита (1–1000, только цифры)
    const limitNum = Number(limit);
    if (Number.isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
      setError("Количество документов должно быть числом от 1 до 1000");
      return;
    }

    setLoading(true);
    setError(null);

    const targetEntity: TargetSearchEntity = {
      type: "company",
      inn: innClean,
    };

    const payload: SearchPayload = {
      issueDateInterval: {
        startDate: normalizeDate(fromDate),
        endDate: normalizeDate(toDate),
      },
      searchContext: {
        targetSearchEntitiesContext: {
          targetSearchEntities: [targetEntity],
          onlyMainRole,
          onlyWithRiskFactors,
          tonality,
          riskFactors: { and: [], or: [], not: [] },
          themes: { and: [], or: [], not: [] },
        },
        searchEntitiesFilter: {
          and: [{ type: "company" }],
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
      limit: limitNum, // ✅ Передаём число
      sortType: "None",
      sortDirectionType: "Desc",
    };

    try {
      const response = await apiClient.post<SearchResponse>(
        "/api/v1/objectsearch",
        payload,
      );
      console.log("✅ Успех:", response.data);

      setSearchParams({
        inn: innClean,
        tonality,
        onlyMainRole: String(onlyMainRole),
        onlyWithRiskFactors: String(onlyWithRiskFactors),
        limit: String(limitNum),
      });

      navigate(`/results?inn=${encodeURIComponent(innClean)}`);
    } catch (err: unknown) {
      console.group("❌ Ошибка запроса");

      if (axios.isAxiosError(err)) {
        console.log("📡 Ответ сервера:", err.response?.data);
        console.log("📤 Отправленные данные:", err.config.data);

        let msg = "Ошибка поиска. Проверьте параметры.";
        const data = err.response?.data;

        if (typeof data === "string") {
          msg = data;
        } else if (data && typeof data === "object") {
          if (data.message) msg = String(data.message);
          if (data.details) {
            const details = Array.isArray(data.details)
              ? data.details.join("; ")
              : String(data.details);
            msg = details;
          }
        }

        setError(msg);
      } else {
        const message =
          err instanceof Error ? err.message : "Неизвестная ошибка";
        console.error("⚠️ Неожиданная ошибка:", message);
        setError(message);
      }

      console.groupEnd();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h1
        style={{ marginBottom: "1.5rem", fontSize: "24px", fontWeight: "600" }}
      >
        Поиск публикаций по ИНН
      </h1>

      {error && (
        <div
          style={{
            color: "#d32f2f",
            marginBottom: "1.5rem",
            padding: "1rem",
            background: "#fff3f3",
            border: "1px solid #ffcdd2",
            borderRadius: "8px",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            ИНН компании
          </label>
          <input
            type="text"
            placeholder="10 или 12 цифр"
            value={inn}
            onChange={(e) => setInn(e.target.value.replace(/\D/g, ""))}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            С даты
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{ width: "100%", padding: "8px", borderRadius: "4px" }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            По дату
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{ width: "100%", padding: "8px", borderRadius: "4px" }}
          />
        </div>

        {/* ✅ Новое поле: количество документов */}
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            Количество документов к выдаче
          </label>
          <input
            type="number"
            min={1}
            max={1000}
            value={limit}
            placeholder="От 1 до 1000"
            onChange={(e) => {
              const val = e.target.value;
              setLimit(val);
            }}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>
      </div>

      <div
        style={{
          background: "#f5f5f5",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "24px",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "16px",
            marginBottom: "12px",
            color: "#333",
          }}
        >
          Фильтры
        </h3>
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          <div>
            <label
              style={{ fontWeight: "600", display: "block", fontSize: "13px" }}
            >
              <input
                type="checkbox"
                checked={onlyMainRole}
                onChange={(e) => setOnlyMainRole(e.target.checked)}
                style={{ marginRight: "6px" }}
              />
              Главная роль в публикации
            </label>
          </div>
          <div>
            <label
              style={{ fontWeight: "600", display: "block", fontSize: "13px" }}
            >
              <input
                type="checkbox"
                checked={onlyWithRiskFactors}
                onChange={(e) => setOnlyWithRiskFactors(e.target.checked)}
                style={{ marginRight: "6px" }}
              />
              Публикации только с риск-факторами
            </label>
          </div>
          <div>
            <label
              style={{
                fontWeight: "600",
                display: "block",
                fontSize: "13px",
                marginRight: "8px",
              }}
            >
              Тональность:
              <select
                value={tonality}
                onChange={(e) => setTonality(e.target.value as TonalityOption)}
                style={{
                  marginLeft: "6px",
                  padding: "4px 8px",
                  borderRadius: "4px",
                }}
              >
                <option value="any">Любая</option>
                <option value="negative">Негативная</option>
                <option value="positive">Позитивная</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <button
        onClick={handleSearch}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#ccc" : "#007bff",
          color: "#fff",
          padding: "12px 24px",
          fontSize: "16px",
          border: "none",
          borderRadius: "6px",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background 0.2s",
        }}
      >
        {loading ? "Поиск..." : "Найти публикации"}
      </button>
    </div>
  );
}

export default SearchFormPage;
