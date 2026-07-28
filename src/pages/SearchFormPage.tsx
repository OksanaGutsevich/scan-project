// src/pages/SearchFormPage.tsx
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "../api/client";
import type {
  HistogramSearchPayload,
  TonalityOption,
  TargetSearchEntity,
  HistogramResponse,
} from "../types";
import axios from "axios";

export function SearchFormPage() {
  const [inn, setInn] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [onlyMainRole, setOnlyMainRole] = useState(true);
  const [onlyWithRiskFactors, setOnlyWithRiskFactors] = useState(false);
  const [tonality, setTonality] = useState<TonalityOption>("any");

  const intervalType = "Month" as const;

  const [histogramTypes, setHistogramTypes] = useState<
    ("totalDocuments" | "riskFactors")[]
  >(["totalDocuments"]);
  const [similarMode] = useState<"None" | "Cluster" | "Document">("None");

  const [limit, setLimit] = useState<string>("100");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔥 Храним ответ API, чтобы отображать данные после загрузки
  const [responseData, setResponseData] = useState<HistogramResponse | null>(
    null,
  );

  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();

  const formatStartDate = (dateStr?: string): string => {
    const d = dateStr ? new Date(dateStr) : new Date();
    return d
      .toISOString()
      .replace("Z", "+03:00")
      .replace(/T\d{2}:\d{2}:\d{2}/, "T00:00:00");
  };

  const formatEndDate = (dateStr?: string): string => {
    const d = dateStr ? new Date(dateStr) : new Date();
    return d
      .toISOString()
      .replace("Z", "+03:00")
      .replace(/T\d{2}:\d{2}:\d{2}/, "T23:59:59");
  };

  const handleSearch = async () => {
    setError(null);
    setResponseData(null); // сбрасываем старые данные

    const innCleanStr = inn.replace(/\D/g, "");
    if (!innCleanStr) {
      setError("Укажите ИНН компании (только цифры).");
      return;
    }

    const innValue = Number(innCleanStr);
    if (Number.isNaN(innValue)) {
      setError("ИНН должен содержать только цифры.");
      return;
    }

    const limitNum = Number(limit);
    if (Number.isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
      setError("Лимит должен быть целым числом от 1 до 1000.");
      return;
    }

    setLoading(true);

    const targetEntity: TargetSearchEntity = {
      type: "company",
      inn: innValue,
      sparkId: null,
      entityId: null,
      maxFullness: true,
      inBusinessNews: null,
    };

    const payload: HistogramSearchPayload = {
      issueDateInterval: {
        startDate: formatStartDate(fromDate),
        endDate: formatEndDate(toDate),
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
      },
      intervalType,
      histogramTypes,
      similarMode,
      limit: limitNum,
      sortType: "issueDate",
      sortDirectionType: "Asc",
      attributeFilters: {
        excludeTechNews: true,
        excludeAnnouncements: true,
        excludeDigests: true,
      },
    };

    try {
      const response = await apiClient.post<HistogramResponse>(
        "/api/v1/objectsearch/histograms",
        payload,
      );

      console.log("✅ Успешный ответ API:", response.data);

      // 🔥 Сохраняем ответ, чтобы использовать в JSX
      setResponseData(response.data);

      setSearchParams({
        inn: innCleanStr,
        view: "histogram",
      });

      // 👇 ВРЕМЕННО ЗАКОММЕНТИРУЙ ЭТУ СТРОКУ, чтобы увидеть ошибку!
      // navigate(`/results?inn=${encodeURIComponent(innCleanStr)}&view=histogram`);
    } catch (err: unknown) {
      console.error("❌ Ошибка запроса:", err);
      let msg = "Не удалось получить данные гистограммы.";

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data;

        if (status === 401) {
          msg = "Ошибка авторизации: токен недействителен или отсутствует.";
        } else if (status === 500 && data) {
          // Пытаемся вытащить понятную причину из 500
          if (typeof data === "string") {
            msg = data;
          } else if (typeof data === "object" && data !== null) {
            if ("message" in data && typeof data.message === "string") {
              msg = data.message;
            } else if ("details" in data) {
              const details = data.details;
              msg = typeof details === "string" ? details : String(details);
            } else {
              // Если ничего нет — выводим JSON как строку (для отладки)
              msg = JSON.stringify(data);
            }
          }
        } else if (data && typeof data === "string") {
          msg = data;
        }
      } else if (err instanceof Error) {
        msg = err.message;
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1
        style={{
          marginBottom: "1.5rem",
          fontSize: "24px",
          fontWeight: "600",
          color: "#333",
        }}
      >
        Статистика публикаций (Гистограммы)
      </h1>

      {error && (
        <div
          style={{
            color: "#d32f2f",
            backgroundColor: "#ffebee",
            border: "1px solid #ffcdd2",
            padding: "16px",
            borderRadius: "8px",
            marginBottom: "24px",
          }}
        >
          <strong>Ошибка:</strong> {error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
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
            ИНН компании *
          </label>
          <input
            type="text"
            placeholder="Только цифры (например, 7710137066)"
            value={inn}
            onChange={(e) => setInn(e.target.value.replace(/\D/g, ""))}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "14px",
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
            С даты *
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "6px",
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
            По дату *
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <div
            style={{
              padding: "12px",
              backgroundColor: "#e3f2fd",
              border: "1px solid #90caf9",
              color: "#0277bd",
              borderRadius: "6px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            📅 Шаг статистики: <strong>Месяц (Month)</strong> — установлено по
            требованиям проекта Shop.Project.
          </div>
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            Что отображать:
          </label>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <label
              style={{
                fontWeight: "normal",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={histogramTypes.includes("totalDocuments")}
                onChange={() => {
                  setHistogramTypes((prev) =>
                    prev.includes("totalDocuments")
                      ? prev.filter((t) => t !== "totalDocuments")
                      : [...prev, "totalDocuments"],
                  );
                }}
                style={{ accentColor: "#007bff" }}
              />
              Всего документов
            </label>
            <label
              style={{
                fontWeight: "normal",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={histogramTypes.includes("riskFactors")}
                onChange={() => {
                  setHistogramTypes((prev) =>
                    prev.includes("riskFactors")
                      ? prev.filter((t) => t !== "riskFactors")
                      : [...prev, "riskFactors"],
                  );
                }}
                style={{ accentColor: "#007bff" }}
              />
              Риск-факторы
            </label>
          </div>
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
            Лимит записей (1–1000)
          </label>
          <input
            type="number"
            min={1}
            max={1000}
            value={limit}
            placeholder="100"
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") {
                setLimit("");
                return;
              }
              const num = Number(val);
              if (!Number.isNaN(num)) {
                if (num < 1) setLimit("1");
                else if (num > 1000) setLimit("1000");
                else setLimit(val);
              }
            }}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          />
          <small style={{ color: "#888", display: "block", marginTop: "4px" }}>
            Значение будет автоматически ограничено диапазоном 1–1000.
          </small>
        </div>
      </div>

      <div
        style={{
          background: "#f5f5f5",
          padding: "16px",
          borderRadius: "8px",
          marginTop: "24px",
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
          Фильтры контекста
        </h3>
        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <label
            style={{
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <input
              type="checkbox"
              checked={onlyMainRole}
              onChange={(e) => setOnlyMainRole(e.target.checked)}
              style={{ marginRight: "4px" }}
            />
            Главная роль
          </label>

          <label
            style={{
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <input
              type="checkbox"
              checked={onlyWithRiskFactors}
              onChange={(e) => setOnlyWithRiskFactors(e.target.checked)}
              style={{ marginRight: "4px" }}
            />
            Только с риск-факторами
          </label>

          <label
            style={{
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            Тональность:
            <select
              value={tonality}
              onChange={(e) => setTonality(e.target.value as TonalityOption)}
              style={{
                padding: "6px 8px",
                borderRadius: "4px",
                marginLeft: "6px",
              }}
            >
              <option value="any">Любая</option>
              <option value="negative">Негативная</option>
              <option value="positive">Позитивная</option>
            </select>
          </label>
        </div>
      </div>

      <button
        onClick={handleSearch}
        disabled={loading}
        style={{
          marginTop: "24px",
          padding: "14px 28px",
          fontSize: "16px",
          background: loading ? "#ccc" : "#007bff",
          color: loading ? "#999" : "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background 0.2s, opacity 0.2s",
        }}
      >
        {loading ? (
          <>
            <span style={{ marginRight: "8px" }}>⏳</span> Загрузка
            гистограммы...
          </>
        ) : (
          "Построить график"
        )}
      </button>

      {/* Блок превью данных — виден только после успешного запроса */}
      {responseData && (
        <div
          style={{
            marginTop: "32px",
            padding: "16px",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            background: "#fafafa",
          }}
        >
          <h3
            style={{ margin: "0 0 12px 0", fontSize: "18px", color: "#2c3e50" }}
          >
            Данные для графика (превью)
          </h3>

          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            {/* Серия: totalDocuments */}
            {responseData.data.some(
              (s) => s.histogramType === "totalDocuments",
            ) && (
              <div style={{ flex: "1", minWidth: "200px" }}>
                <h4
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "14px",
                    color: "#555",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Всего документов
                </h4>
                <pre
                  style={{
                    background: "#fff",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "#333",
                    maxHeight: "200px",
                    overflowY: "auto",
                    margin: 0,
                  }}
                >
                  {JSON.stringify(
                    responseData.data.find(
                      (s) => s.histogramType === "totalDocuments",
                    )?.data,
                    null,
                    2,
                  )}
                </pre>
              </div>
            )}

            {/* Серия: riskFactors */}
            {responseData.data.some(
              (s) => s.histogramType === "riskFactors",
            ) && (
              <div style={{ flex: "1", minWidth: "200px" }}>
                <h4
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "14px",
                    color: "#555",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Риск-факторы
                </h4>
                <pre
                  style={{
                    background: "#fff",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "#333",
                    maxHeight: "200px",
                    overflowY: "auto",
                    margin: 0,
                  }}
                >
                  {JSON.stringify(
                    responseData.data.find(
                      (s) => s.histogramType === "riskFactors",
                    )?.data,
                    null,
                    2,
                  )}
                </pre>
              </div>
            )}
          </div>

          <p style={{ marginTop: "16px", fontSize: "13px", color: "#777" }}>
            В реальном проекте эти данные нужно передать в компонент графика
            (например, Recharts / Chart.js).
          </p>
        </div>
      )}
    </div>
  );
}

export default SearchFormPage;
