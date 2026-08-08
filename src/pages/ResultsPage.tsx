// src/pages/ResultsPage.tsx
import { useEffect, useReducer, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom"; // если понадобится, но мы уже импортировали выше
import apiClient from "../api/client";
import axios from "axios";
import type {
  TargetSearchEntity,
  TonalityOption,
  SearchResponse,
  ScanDoc,
  HistogramResponse,
  HistogramSeries,
} from "../types";
import { PublicationCard } from "../components/PublicationCard";
import styles from "./ResultPage.module.css";
import { Header } from "../components/Header/Header";
import arrowleftImage from "../assets/icons/arrowleft.png";
import arrowrightImage from "../assets/icons/arrowright.png";
import resultPageImage from "../assets/icons/resultpageimage.png";

// --- Вспомогательные функции (вне компонента) ---
const formatStartDate = (dateStr?: string): string => {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().replace("Z", "+03:00");
};

const formatEndDate = (dateStr?: string): string => {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString().replace("Z", "+03:00");
};

// loadData теперь принимает все нужные данные как аргументы — это делает её чистой
const loadData = async ({
  inn,
  limitParam,
  onlyMainRole,
  onlyWithRiskFactors,
  tonality,
  fromDate,
  toDate,
}: {
  inn: string;
  limitParam: string;
  onlyMainRole: boolean;
  onlyWithRiskFactors: boolean;
  tonality: TonalityOption;
  fromDate: string | null;
  toDate: string | null;
}) => {
  const innCleanStr = inn;
  const limitNum = Number(limitParam);

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

  const [histogramRes, searchRes] = await Promise.all([
    apiClient.post<HistogramResponse>("/api/v1/objectsearch/histograms", {
      issueDateInterval,
      searchContext,
      intervalType: "month" as const,
      histogramTypes: ["totalDocuments", "riskFactors"] as const,
      similarMode: "None",
      limit: 36,
      sortType: "issueDate",
      sortDirectionType: "asc",
      attributeFilters: {
        excludeTechNews: true,
        excludeAnnouncements: true,
        excludeDigests: true,
      },
    }),
    apiClient.post<SearchResponse>("/api/v1/objectsearch", {
      issueDateInterval,
      searchContext,
      limit: limitNum,
      offset: 0,
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

  return {
    histogramData: histogramRes.data,
    searchResult: searchRes.data,
  };
};

const loadDocumentsByIds = async (ids: string[]): Promise<ScanDoc[]> => {
  if (ids.length === 0) return [];

  const res = await apiClient.post("/api/v1/documents", { ids });
  // res.data — это массив вида: [{ ok: ScanDoc }, { fail: { errorCode, errorMessage } }, ...]

  const raw = res.data;

  if (!Array.isArray(raw)) {
    console.warn("Неожиданный формат ответа от /documents:", raw);
    return [];
  }

  return raw
    .map((item: unknown) => {
      if (typeof item !== "object" || item === null) {
        return null;
      }

      const typed = item as {
        ok?: ScanDoc;
        fail?: { errorCode: string; errorMessage: string };
      };

      if ("ok" in typed && typed.ok) {
        return typed.ok;
      }
      if ("fail" in typed && typed.fail) {
        console.warn(
          `Не удалось загрузить документ по ID: ${typed.fail.errorCode} — ${typed.fail.errorMessage}`,
        );
        return null;
      }
      return null;
    })
    .filter((doc): doc is ScanDoc => doc !== null);
};

// --- Блок гистограммы (в стиле карусели) ---
function HistogramBlock({ data }: { data: HistogramResponse | null }) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  if (!data || data.data.length === 0) return null;

  const totalSeries = data.data.find(
    (s) => s.histogramType === "totalDocuments",
  );
  const riskSeries = data.data.find((s) => s.histogramType === "riskFactors");

  if (!totalSeries && !riskSeries) return null;

  // Показываем только последние 12 месяцев
  const points = (totalSeries?.data ?? riskSeries?.data)?.slice(-12);
  if (!points || points.length === 0) return null;

  const formatMonthYear = (iso: string): string => {
    const d = new Date(iso);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${month}.${year}`;
  };

  const getValueByDate = (
    series: HistogramSeries | undefined,
    dateIso: string,
  ) => {
    if (!series) return 0;
    const point = series.data.find((p) => p.date === dateIso);
    return point ? (point.value ?? 0) : 0;
  };

  const totalSum = totalSeries
    ? totalSeries.data.reduce((sum, p) => sum + (p.value ?? 0), 0)
    : 0;

  const scrollBy = (amount: number) => {
    if (wrapperRef.current) {
      wrapperRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  const prev = () => scrollBy(-200);
  const next = () => scrollBy(200);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const checkScroll = () => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth);
    };

    // Слушаем скролл
    el.addEventListener("scroll", checkScroll);
    // Слушаем изменение размеров
    window.addEventListener("resize", checkScroll);

    // Проверка сразу после монтирования
    checkScroll();

    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  return (
    <section className={styles.histogramSection}>
      <h3 className={styles.histogramTitle}>Общая сводка</h3>

      <div className={styles.histogramTotals}>
        <span>
          Найдено{" "}
          <strong className={styles.totalValue}>
            {totalSum.toLocaleString()}
          </strong>
          вариантов
        </span>
      </div>

      {/* Обёртка как в карусели: overflow + position:relative для кнопок */}
      <div className={styles.histogramControls}>
        <div className={styles.wrapper}>
          {/* Кнопка «Назад» */}
          <button
            type="button"
            onClick={prev}
            className={`${styles.navButton} ${styles.prev}`}
            aria-label="Прокрутить влево"
            disabled={!canScrollLeft}
          >
            <img src={arrowleftImage} alt="" className={styles.arrowImg} />
          </button>

          {/* Прокручиваемый контейнер */}
          <div ref={wrapperRef} className={styles.histogramWrapper}>
            {/* Шапка (месяцы) */}
            <div className={styles.histogramHeaderRow}>
              <div className={styles.fixedCell}>Период</div>
              {points.map((point) => (
                <div key={point.date} className={styles.monthCell}>
                  {formatMonthYear(point.date)}
                </div>
              ))}
            </div>

            {/* Строка "Всего" */}
            <div className={styles.histogramDataRow}>
              <div className={styles.fixedCell}>Всего</div>
              {points.map((point) => {
                const total = getValueByDate(totalSeries, point.date);
                return (
                  <div key={point.date} className={styles.dataCell}>
                    {total.toLocaleString()}
                  </div>
                );
              })}
            </div>

            {/* Строка "Риски" */}
            <div
              className={`${styles.histogramDataRow} ${styles.histogramRowRisks}`}
            >
              <div className={styles.fixedCell}>Риски</div>
              {points.map((point) => {
                const risks = getValueByDate(riskSeries, point.date);
                return (
                  <div key={point.date} className={styles.dataCell}>
                    {risks.toLocaleString()}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Кнопка «Вперёд» */}
          <button
            type="button"
            onClick={next}
            className={`${styles.navButton} ${styles.next}`}
            aria-label="Прокрутить вправо"
            disabled={!canScrollRight}
          >
            <img src={arrowrightImage} alt="" className={styles.arrowImg} />
          </button>
        </div>
      </div>
    </section>
  );
}

// --- Блок списка публикаций ---
function PublicationsBlock({
  searchResult,
  documents,
  onShowMore,
}: {
  searchResult: SearchResponse | null;
  documents: ScanDoc[];
  onShowMore: () => Promise<void>;
}) {
  if (!searchResult) return null;

  const hasMore = documents.length < searchResult.items.length;

  return (
    <section className={styles.publicationsSection}>
      <h3 className={styles.publicationsTitle}>Список документов</h3>

      {documents.length === 0 ? (
        <p className={styles.noPublications}>Нет загруженных публикаций</p>
      ) : (
        <>
          {/* Контейнер-сетка */}
          <div className={styles.cardsGrid}>
            {documents.map((doc) => (
              <PublicationCard key={doc.id} doc={doc} />
            ))}
          </div>

          {hasMore && (
            <div className={styles.showMoreContainer}>
              <button
                onClick={() => onShowMore()}
                className={styles.showMoreButton}
              >
                Показать больше
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

type State = {
  loading: boolean;
  error: string | null;
  histogramData: HistogramResponse | null;
  searchResult: SearchResponse | null;
  documents: ScanDoc[];
};

type Action =
  | { type: "startLoad" }
  | {
      type: "loadSuccess";
      payload: {
        histogramData: HistogramResponse;
        searchResult: SearchResponse;
      };
    }
  | { type: "setDocuments"; payload: ScanDoc[] }
  | { type: "appendDocuments"; payload: ScanDoc[] }
  | { type: "loadError"; payload: string };

function reducer(state: State, action: Action): State {
  // Debug: log reducer actions to help trace state transitions
  // (Acceptable for debugging; remove or guard in production)

  console.debug("reducer action:", action.type);

  switch (action.type) {
    case "startLoad":
      return {
        ...state,
        loading: true,
        error: null,
        histogramData: null,
        searchResult: null,
        documents: [],
      };
    case "loadSuccess":
      return {
        ...state,
        loading: false,
        histogramData: action.payload.histogramData,
        searchResult: action.payload.searchResult,
      };
    case "setDocuments":
      return {
        ...state,
        documents: action.payload,
      };
    case "appendDocuments":
      return {
        ...state,
        documents: [...state.documents, ...action.payload],
      };
    case "loadError":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
}

export function ResultsPage() {
  const [searchParams] = useSearchParams();
  const inn = searchParams.get("inn");
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");
  const onlyMainRole = searchParams.get("onlyMainRole") === "true";
  const onlyWithRiskFactors =
    searchParams.get("onlyWithRiskFactors") === "true";
  const tonality = (searchParams.get("tonality") as TonalityOption) || "any";
  const limitParam = searchParams.get("limit") || "20";

  const hasInn = !!inn;

  const [state, dispatch] = useReducer(reducer, hasInn, (hasInnFlag) => ({
    loading: !hasInnFlag,
    error: !hasInnFlag ? "ИНН не передан в параметрах URL." : null,
    histogramData: null,
    searchResult: null,
    documents: [],
  }));

  const { loading, error, histogramData, searchResult, documents } = state;

  // track requests to ignore stale responses
  const lastRequestId = useRef(0);

  useEffect(() => {
    if (!hasInn) {
      return;
    }

    const requestId = ++lastRequestId.current;
    // Debug: log effect start with params and requestId

    console.debug("ResultsPage effect start", {
      requestId,
      inn,
      fromDate,
      toDate,
      onlyMainRole,
      onlyWithRiskFactors,
      tonality,
      limitParam,
    });

    dispatch({ type: "startLoad" });

    loadData({
      inn: inn as string,
      limitParam,
      onlyMainRole,
      onlyWithRiskFactors,
      tonality,
      fromDate,
      toDate,
    })
      .then(({ histogramData: hd, searchResult: sr }) => {
        // if newer request started meanwhile — ignore this response
        if (requestId !== lastRequestId.current) {
          console.debug("Ignored stale loadData response", {
            requestId,
            current: lastRequestId.current,
          });
          return;
        }

        // Debug: successful primary response

        console.debug("loadData success", {
          requestId,
          itemsCount: sr?.items?.length ?? 0,
        });

        dispatch({
          type: "loadSuccess",
          payload: { histogramData: hd, searchResult: sr },
        });

        const items = sr?.items;
        if (Array.isArray(items) && items.length > 0) {
          const first10Ids = items.slice(0, 10).map((i) => i.encodedId);
          loadDocumentsByIds(first10Ids).then((newDocs) => {
            if (requestId !== lastRequestId.current) {
              console.debug("Ignored stale documents response", {
                requestId,
                current: lastRequestId.current,
              });
              return;
            }

            console.debug("setDocuments", { requestId, count: newDocs.length });
            dispatch({ type: "setDocuments", payload: newDocs });
          });
        }
      })
      .catch((err: unknown) => {
        if (requestId !== lastRequestId.current) {
          console.debug("Ignored stale loadData error", {
            requestId,
            current: lastRequestId.current,
          });
          return;
        }

        console.error("Ошибка загрузки результатов:", err);

        let msg: string;

        if (axios.isAxiosError(err)) {
          if (err.response && err.response.data) {
            msg =
              typeof err.response.data === "string"
                ? err.response.data
                : JSON.stringify(err.response.data, null, 2);
          } else if (err.request) {
            msg = "Нет ответа от сервера (сетевая ошибка).";
          } else {
            msg = err.message;
          }
        } else if (err instanceof Error) {
          msg = err.message;
        } else {
          msg = String(err);
        }

        dispatch({ type: "loadError", payload: msg });
      });

    return () => {
      console.debug("ResultsPage effect cleanup", {
        requestId,
        lastRequestId: lastRequestId.current,
      });
    };
  }, [
    hasInn,
    inn,
    fromDate,
    toDate,
    onlyMainRole,
    onlyWithRiskFactors,
    tonality,
    limitParam,
  ]);

  const handleShowMore = async () => {
    if (!searchResult || documents.length === 0) return;

    const alreadyLoadedCount = documents.length;
    const nextOffset = alreadyLoadedCount;

    const nextIds = searchResult.items
      .slice(nextOffset, nextOffset + 10)
      .map((i) => i.encodedId);

    if (nextIds.length === 0) return;

    const newDocs = await loadDocumentsByIds(nextIds);
    dispatch({ type: "appendDocuments", payload: newDocs });
  };

  if (loading) {
    return (
      <div className={styles.resultsPage}>
        <Header />
        <div className={styles.loadingBlock}>
          <p>Загружаем данные</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.resultsPage}>
        <Header />
        <div className={styles.errorBlock}>
          <h3>Ошибка</h3>
          <pre>{error}</pre>
          <br />
          <a href="/search" className={styles.backLink}>
            ← Вернуться к поиску
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.resultsPage}>
      <Header />
      <div className={styles.resultPageTitleImage}>
        <div>
          <h1 className={styles.resultPageTitle}>
            Ищем. Скоро <br /> будут результаты
          </h1>

          <span>
            Поиск может занять некоторое время, <br /> просим сохранять терпение
          </span>
        </div>

        <img
          src={resultPageImage}
          alt="Картинка сервиса по поиску ИНН"
          className={styles.resultPageImage}
          aria-hidden="true"
        />
      </div>

      <HistogramBlock data={histogramData} />

      <PublicationsBlock
        searchResult={searchResult}
        documents={documents}
        onShowMore={handleShowMore}
      />

      <br />
      <a href="/search" className={styles.backLink}>
        ← Вернуться к поиску
      </a>
    </div>
  );
}

export default ResultsPage;
