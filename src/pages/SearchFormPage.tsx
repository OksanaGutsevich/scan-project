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
import styles from "./SearchFormPage.module.css";

export function SearchFormPage() {
  const [inn, setInn] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [onlyMainRole, setOnlyMainRole] = useState(true);
  const [onlyWithRiskFactors, setOnlyWithRiskFactors] = useState(false);
  const [tonality, setTonality] = useState<TonalityOption>("any");

  const intervalType = "Month" as const;

  // Всегда запрашиваем только totalDocuments — чекбоксы удалены
  const histogramTypes: ("totalDocuments" | "riskFactors")[] = [
    "totalDocuments",
  ];

  const [similarMode] = useState<"None" | "Cluster" | "Document">("None");
  const [limit, setLimit] = useState<string>("100");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<HistogramResponse | null>(
    null,
  );

  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();

  /**
   * Форматирует дату начала интервала: день с 00:00:00.000 в UTC (Z)
   */
  const formatStartDate = (dateStr?: string): string => {
    const d = dateStr ? new Date(dateStr) : new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  };

  /**
   * Форматирует дату конца интервала: день с 23:59:59.999 в UTC (Z)
   */
  const formatEndDate = (dateStr?: string): string => {
    const d = dateStr ? new Date(dateStr) : new Date();
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
  };

  const handleSearch = async () => {
    setError(null);
    setResponseData(null);

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

    console.log("📦 Payload перед отправкой:", {
      histogramTypes: payload.histogramTypes,
      issueDateInterval: payload.issueDateInterval,
    });

    try {
      const response = await apiClient.post<HistogramResponse>(
        "/api/v1/objectsearch/histograms",
        payload,
      );

      console.log("✅ Успешный ответ API:", response.data);
      setResponseData(response.data);

      setSearchParams({
        inn: innCleanStr,
        view: "histogram",
      });
    } catch (err: unknown) {
      console.error("❌ Ошибка запроса:", err);
      let msg = "Не удалось получить данные гистограммы.";

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data;

        if (status === 401) {
          msg = "Ошибка авторизации: токен недействителен или отсутствует.";
        } else if (status === 500 && data) {
          if (typeof data === "string") {
            msg = data;
          } else if (data !== null && typeof data === "object") {
            const obj = data as Record<string, unknown>;
            if ("message" in obj && typeof obj.message === "string") {
              msg = obj.message;
            } else if ("details" in obj) {
              const details = obj.details;
              if (typeof details === "string") {
                msg = details;
              } else {
                msg = String(details);
              }
            } else {
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

  // Считаем суммарное количество документов автоматически
  const totalDocuments = responseData
    ? responseData.data
        .filter((s) => s.histogramType === "totalDocuments")
        .flatMap((s) => s.data)
        .reduce((sum, point) => sum + (point.value ?? 0), 0)
    : 0;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Найдите необходимые данные в пару кликов</h1>

      {error && (
        <div className={styles.errorBlock}>
          <strong>Ошибка:</strong> {error}
        </div>
      )}

      <div className={styles.gridForm}>
        <div className={styles.formField}>
          <label className={styles.label}>ИНН компании *</label>
          <input
            type="text"
            placeholder="Только цифры (например, 7710137066)"
            value={inn}
            onChange={(e) => setInn(e.target.value.replace(/\D/g, ""))}
            className={styles.input}
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.label}>С даты *</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.formField}>
          <label className={styles.label}>По дату *</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.label}>
            Количество документов к выдаче*
          </label>
          <input
            type="number"
            min={1}
            max={1000}
            value={limit}
            placeholder="От 1 до 1000"
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
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.filtersBlock}>
        <h3 className={styles.filtersTitle}>Фильтры контекста</h3>
        <div className={styles.filtersRow}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={onlyMainRole}
              onChange={(e) => setOnlyMainRole(e.target.checked)}
              className={styles.checkbox}
            />
            Главная роль в публикации
          </label>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={onlyWithRiskFactors}
              onChange={(e) => setOnlyWithRiskFactors(e.target.checked)}
              className={styles.checkbox}
            />
            Публикации с риск-факторами
          </label>

          <label className={styles.selectLabel}>
            Тональность:
            <select
              value={tonality}
              onChange={(e) => setTonality(e.target.value as TonalityOption)}
              className={styles.select}
            >
              <option value="any">Любая</option>
              <option value="negative">Негативная</option>
              <option value="positive">Позитивная</option>
            </select>
          </label>
        </div>
      </div>

      <button onClick={handleSearch} disabled={loading} className={styles.btn}>
        {loading ? (
          <>
            <span className={styles.spinner}>⏳</span> Загрузка гистограммы...
          </>
        ) : (
          "Построить график"
        )}
      </button>

      {/* Блок превью данных (для отладки) */}
      {responseData && (
        <div className={styles.previewBlock}>
          <h3 className={styles.previewTitle}>Данные для графика (превью)</h3>

          {responseData.data.some(
            (s) => s.histogramType === "totalDocuments",
          ) && (
            <div className={styles.previewItem}>
              <h4 className={styles.previewSubtitle}>
                Всего документов (серии)
              </h4>
              <pre className={styles.previewData}>
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

          {!responseData.data.length && (
            <p className={styles.emptyMessage}>
              Данные не получены: сервер вернул пустой массив серий. Проверьте
              логи сервера и консоль браузера.
            </p>
          )}

          <p className={styles.note}>
            В реальном проекте эти данные нужно передать в компонент графика
            (например, Recharts / Chart.js).
          </p>
        </div>
      )}
    </div>
  );
}

export default SearchFormPage;
