// src/pages/SearchFormPage.tsx
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "../api/client";
import type {
  TargetSearchEntity,
  TonalityOption,
  SearchPayload,
  HistogramSearchPayload,
  SearchResponse,
  ScanDoc,
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

  // Лимит — количество документов к выдаче (1–1000)
  const [limit, setLimit] = useState<string>("20");

  const intervalType = "Month" as const;
  // Важно: не делаем readonly-массив, а просто обычный массив — тогда приведение не нужно
  const histogramTypes = ["totalDocuments"] as (
    | "totalDocuments"
    | "riskFactors"
  )[];
  const similarMode = "None" as const;

  const [histogramData, setHistogramData] = useState<HistogramResponse | null>(
    null,
  );
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);
  const [documents, setDocuments] = useState<ScanDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();

  const formatStartDate = (dateStr?: string): string => {
    const d = dateStr ? new Date(dateStr) : new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  };

  const formatEndDate = (dateStr?: string): string => {
    const d = dateStr ? new Date(dateStr) : new Date();
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
  };

  const handleSearch = async () => {
    setError(null);
    setHistogramData(null);
    setSearchResult(null);
    setDocuments([]);

    const innCleanStr = inn.replace(/\D/g, "");
    if (!innCleanStr) {
      setError("Укажите ИНН компании (только цифры).");
      return;
    }

    const limitNum = Number(limit);
    if (Number.isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
      setError("Лимит должен быть целым числом от 1 до 1000.");
      return;
    }

    setLoading(true);

    // Базовый targetSearchEntitiesContext (без лишних полей)
    const targetEntity: TargetSearchEntity = {
      type: "company",
      inn: innCleanStr,
      sparkId: null,
      entityId: null,
      inBusinessNews: null,
      maxFullness: true,
    };

    const searchContext = {
      targetSearchEntitiesContext: {
        targetSearchEntities: [targetEntity],
        onlyMainRole,
        onlyWithRiskFactors,
        tonality,
        riskFactors: { and: [], or: [], not: [] },
        themes: { and: [], or: [], not: [] },
      },
      searchEntitiesFilter: { and: [], or: [], not: [] },
      locationsFilter: { and: [], or: [], not: [] },
      themesFilter: { and: [], or: [], not: [] },
    };

    const issueDateInterval = {
      startDate: formatStartDate(fromDate),
      endDate: formatEndDate(toDate),
    };

    try {
      console.log("🚀 Начинаем параллельные запросы...");

      const [histogramRes, searchRes] = await Promise.all([
        // Гистограмма
        apiClient.post<HistogramResponse>("/api/v1/objectsearch/histograms", {
          issueDateInterval,
          searchContext,
          intervalType: "month" as const,
          histogramTypes: ["totalDocuments"] as const,
          similarMode: "None",
          limit: 12,
          sortType: "issueDate",
          sortDirectionType: "asc",
          attributeFilters: {
            excludeTechNews: true,
            excludeAnnouncements: true,
            excludeDigests: true,
          },
        }),

        // Поиск публикаций
        apiClient.post<SearchResponse>("/api/v1/objectsearch", {
          issueDateInterval,
          searchContext,
          limit: limitNum,
          offset: 0,
          // Важно: именно эти значения, как в примере API
          sortType: "sourceInfluence",
          sortDirectionType: "desc",
          intervalType: "month" as const,
          similarMode: "None",
          attributeFilters: {
            excludeTechNews: true,
            excludeAnnouncements: true,
            excludeDigests: true,
          },
          searchArea: {
            includedSources: [],
            excludedSources: [],
            includedSourceGroups: [],
            excludedSourceGroups: [],
            includedDistributionMethods: [],
            excludedDistributionMethods: [],
          },
        }),
      ]);

      console.log("✅ Запросы успешны");
      console.log("📊 Гистограмма:", histogramRes.data);
      console.log("🔍 Поиск:", searchRes.data);

      setHistogramData(histogramRes.data);
      setSearchResult(searchRes.data);

      // ЗАЩИТА: проверяем, что items — это массив, прежде чем итерировать
      const items = searchRes.data?.items;
      if (!Array.isArray(items)) {
        console.warn(
          "⚠️ items не является массивом. Полный ответ:",
          searchRes.data,
        );
        setError(
          "Сервер вернул неожиданный формат данных (поле items отсутствует или не массив). Проверьте вкладку Network.",
        );
        // Не ставим view=results, потому что данные невалидны
        return;
      }

      if (items.length > 0) {
        const first10EncodedIds = items.slice(0, 10).map((i) => i.encodedId);
        await loadDocumentsByIds(first10EncodedIds);
      } else {
        console.log(
          "ℹ️ Найдено 0 публикаций — это нормально, если в диапазоне нет данных.",
        );
      }

      // Обновляем URL только если всё прошло успешно
      setSearchParams({ inn: innCleanStr, view: "results" });
      console.log("🔗 URL обновлён: view=results");
    } catch (err: unknown) {
      console.error("❌ Ошибка параллельных запросов:", err);

      let msg = "Не удалось выполнить поиск.";
      if (axios.isAxiosError(err) && err.response?.data) {
        msg =
          typeof err.response.data === "string"
            ? err.response.data
            : JSON.stringify(err.response.data, null, 2);
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const loadDocumentsByIds = async (ids: string[]) => {
    if (ids.length === 0) return;

    try {
      const res = await apiClient.post<{ items: ScanDoc[] }>(
        "/api/v1/documents",
        {
          ids,
        },
      );
      setDocuments((prev) => [...prev, ...res.data.items]);
    } catch (e: unknown) {
      console.error("❌ Ошибка загрузки содержимого документов:", e);
      setError("Не удалось загрузить содержимое публикаций.");
    }
  };

  const handleShowMore = async () => {
    if (!searchResult) return;

    const alreadyLoadedCount = documents.length;
    const nextOffset = alreadyLoadedCount;

    const nextIds = searchResult.items
      .slice(nextOffset, nextOffset + 10)
      .map((i) => i.encodedId);

    if (nextIds.length === 0) return;

    await loadDocumentsByIds(nextIds);
  };

  const totalDocuments = histogramData
    ? histogramData.data
        .filter((s) => s.histogramType === "totalDocuments")
        .flatMap((s) => s.data)
        .reduce((sum, point) => sum + (point.value ?? 0), 0)
    : 0;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Поиск данных по компании</h1>

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
            Количество документов в выдаче (1–1000)*
          </label>
          <input
            type="number"
            min={1}
            max={1000}
            value={limit}
            placeholder="1–1000"
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") {
                setLimit("");
                return;
              }
              const num = Number(val);
              if (!Number.isNaN(num) && num >= 1 && num <= 1000)
                setLimit(String(num));
            }}
            className={styles.input}
          />
          <small className={styles.hint}>
            Это количество записей, которые будут найдены и доступны для
            подгрузки. Гистограмма строится отдельно (шаг — месяц).
          </small>
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
        {loading ? "⏳ Загрузка…" : "Найти и построить"}
      </button>

      {/* Блок гистограммы */}
      {histogramData && (
        <div className={styles.previewBlock}>
          <h3 className={styles.previewTitle}>
            Гистограмма (статистика по месяцам)
          </h3>
          <p>
            Всего документов за выбранный период:{" "}
            <strong>{totalDocuments.toLocaleString()}</strong>
          </p>
          {/* Сюда можно вставить график (Recharts/Chart.js) */}
          <pre className={styles.previewData}>
            {JSON.stringify(histogramData.data, null, 2)}
          </pre>
        </div>
      )}

      {/* Блок списка публикаций */}
      <div className={styles.previewBlock}>
        <h3 className={styles.previewTitle}>Список публикаций</h3>

        {searchResult && (
          <div className={styles.meta}>
            Найдено публикаций:{" "}
            <strong>{searchResult.items.length.toLocaleString()}</strong>.
            Загружено: <strong>{documents.length}</strong>.
          </div>
        )}

        <ul className={styles.list}>
          {documents.length === 0 ? (
            <li className={styles.emptyMessage}>Нет загруженных публикаций</li>
          ) : (
            documents.map((doc) => (
              <li key={doc.id} className={styles.item}>
                <h4 className={styles.itemTitle}>{doc.title.text}</h4>
                <div className={styles.itemMeta}>
                  <span>
                    Дата: {new Date(doc.issueDate).toLocaleDateString()}
                  </span>
                  {" • "}
                  <span>{doc.source.name}</span>
                </div>
                <p className={styles.snippet}>{doc.content.markup}</p>
              </li>
            ))
          )}
        </ul>

        {searchResult && documents.length < searchResult.items.length && (
          <button onClick={handleShowMore} className={styles.btnSecondary}>
            Показать больше
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchFormPage;
