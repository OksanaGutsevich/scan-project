// src/pages/ResultsPage.tsx
import { useEffect, useReducer, useRef } from "react";
import { useSearchParams } from "react-router-dom"; // если понадобится, но мы уже импортировали выше
import apiClient from "../api/client";
import axios from "axios";
import type {
  TargetSearchEntity,
  TonalityOption,
  SearchResponse,
  ScanDoc,
  HistogramResponse,
} from "../types";

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

const loadDocumentsByIds = async (ids: string[]) => {
  if (ids.length === 0) return [] as ScanDoc[];
  const res = await apiClient.post<{ items: ScanDoc[] }>("/api/v1/documents", {
    ids,
  });
  return res.data.items;
};

// --- Блок гистограммы ---
function HistogramBlock({ data }: { data: HistogramResponse | null }) {
  if (!data) return null;

  const totalDocuments = data.data
    .filter((s) => s.histogramType === "totalDocuments")
    .flatMap((s) => s.data)
    .reduce((sum, point) => sum + (point.value ?? 0), 0);

  return (
    <section style={{ marginBottom: "32px" }}>
      <h3>Гистограмма (статистика по месяцам)</h3>
      <p>
        Всего документов за выбранный период:{" "}
        <strong>{totalDocuments.toLocaleString()}</strong>
      </p>
      <pre
        style={{
          background: "#f5f5f5",
          padding: "16px",
          borderRadius: "8px",
          maxHeight: "400px",
          overflowY: "auto",
          whiteSpace: "pre-wrap",
        }}
      >
        {JSON.stringify(data, null, 2)}
      </pre>
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
    <section>
      <h3>Список публикаций</h3>
      <div style={{ marginBottom: "12px", color: "#555" }}>
        Найдено публикаций:{" "}
        <strong>{searchResult.items.length.toLocaleString()}</strong>.
        Загружено: <strong>{documents.length}</strong>.
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {documents.length === 0 ? (
          <li style={{ padding: "12px", color: "#888" }}>
            Нет загруженных публикаций
          </li>
        ) : (
          documents.map((doc) => (
            <li
              key={doc.id}
              style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}
            >
              <h4 style={{ margin: "0 0 6px 0", fontSize: "15px" }}>
                {doc.title.text || "Без заголовка"}
              </h4>
              <div
                style={{ fontSize: "13px", color: "#666", marginBottom: "6px" }}
              >
                <span>
                  Дата: {new Date(doc.issueDate).toLocaleDateString()}
                </span>{" "}
                {" • "}
                <span>{doc.source?.name || "Неизвестный источник"}</span>
              </div>
              <p style={{ margin: 0, color: "#333", lineHeight: "1.4" }}>
                {doc.content?.markup || "Нет текста публикации"}
              </p>
            </li>
          ))
        )}
      </ul>

      {hasMore && (
        <button
          onClick={() => onShowMore()}
          style={{
            marginTop: "16px",
            padding: "8px 16px",
            backgroundColor: "#f0f0f0",
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          Показать больше
        </button>
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

    // cleanup: nothing to abort here because we ignore stale responses by id
    // but we log when effect is cleaned up (debug)
    return () => {
      console.debug("ResultsPage effect cleanup", {
        requestId,
        lastRequestId: lastRequestId.current,
      });
    };
  }, [
    hasInn, // <-- ДОБАВЛЕНО: теперь правило не ругается
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
      <div style={{ padding: "24px", textAlign: "center" }}>
        <p>Загрузка данных…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "24px", color: "#b00020" }}>
        <h3>Ошибка</h3>
        <pre
          style={{
            background: "#f5f5f5",
            padding: "16px",
            borderRadius: "8px",
            whiteSpace: "pre-wrap",
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          {error}
        </pre>
        <br />
        <a href="/search" style={{ color: "#1976d2", fontSize: "14px" }}>
          ← Вернуться к поиску
        </a>
      </div>
    );
  }

  return (
    <div className="results-page" style={{ padding: "20px" }}>
      <h1>Результаты поиска по ИНН: {inn}</h1>

      <HistogramBlock data={histogramData} />

      <PublicationsBlock
        searchResult={searchResult}
        documents={documents}
        onShowMore={handleShowMore}
      />

      <br />
      <a href="/search" style={{ color: "#1976d2", fontSize: "14px" }}>
        ← Вернуться к поиску
      </a>
    </div>
  );
}

export default ResultsPage;
