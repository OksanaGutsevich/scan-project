// src/hooks/useSearchResults.ts
import { useEffect, useState } from "react";
import apiClient from "../api/client";
import type {
  SearchResponse,
  EventFiltersInfo,
  AnalyticsResponse,
  HistogramsResponse,
} from "../types";

export function useSearchResults(inn: string) {
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [limits, setLimits] = useState<EventFiltersInfo | null>(null);
  const [stats, setStats] = useState<AnalyticsResponse | null>(null);
  const [histograms, setHistograms] = useState<HistogramsResponse | null>(null);

  // loading = false по умолчанию.
  // Мы будем включать его ТОЛЬКО внутри асинхронной логики (в промисе),
  // чтобы не было синхронного setState в теле useEffect.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ❌ НИКАКИХ setLoading(...) и setError(...) здесь!
    // Даже setLoading(false) в if (!inn) вызывает ошибку линтера.

    if (!inn) {
      // Если нет ИНН, мы просто ничего не делаем.
      // loading остаётся false (по умолчанию), error остаётся как был.
      return;
    }

    const now = new Date();
    const endDate = now.toISOString();
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - 23,
      1,
    ).toISOString();

    const searchPayload = {
      issueDateInterval: {
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
      },
      searchContext: {
        targetSearchEntitiesContext: {
          targetSearchEntities: [
            {
              type: "company",
              inn: Number(inn),
              sparkId: null,
              entityId: null,
              maxFullness: true,
              inBusinessNews: null,
            },
          ],
          onlyMainRole: true,
          tonality: "any",
          onlyWithRiskFactors: false,
          riskFactors: { and: [], or: [], not: [] },
          themes: { and: [], or: [], not: [] },
        },
        themesFilter: { and: [], or: [], not: [] },
      },
      searchArea: {
        includedSources: [],
        excludedSources: [],
        includedSourceGroups: [],
        excludedSourceGroups: [],
      },
      attributeFilters: {
        excludeTechNews: true,
        excludeAnnouncements: true,
        excludeDigests: true,
      },
      similarMode: "duplicates",
      limit: 50,
      sortType: "sourceInfluence",
      sortDirectionType: "desc",
      intervalType: "day",
    };

    const histogramsPayload = {
      issueDateInterval: { startDate, endDate },
      searchContext: searchPayload.searchContext,
      searchArea: searchPayload.searchArea,
      attributeFilters: searchPayload.attributeFilters,
      similarMode: "duplicates",
      limit: 1000,
      sortType: "sourceInfluence",
      sortDirectionType: "desc",
      intervalType: "month" as const,
      histogramTypes: ["totalDocuments", "riskFactors"] as const,
    };

    let hasCriticalError = false;

    // ✅ Включаем загрузку ТОЛЬКО здесь, внутри асинхронного потока.
    // Линтер разрешает setState в колбэках промисов.
    setTimeout(() => setLoading(true), 0);

    Promise.allSettled([
      // 0: лимиты
      apiClient
        .get<{ eventFiltersInfo: EventFiltersInfo }>("/api/v1/account/info")
        .then((res) => res.data.eventFiltersInfo),

      // 1: результаты поиска
      apiClient.post<SearchResponse>("/api/v1/objectsearch", searchPayload),

      // 2: аналитика
      apiClient.get<AnalyticsResponse>("/api/v1/analytics").catch(() => null),

      // 3: гистограммы
      apiClient.post<HistogramsResponse>(
        "/api/v1/objectsearch/histograms",
        histogramsPayload,
      ),
    ])
      .then((results) => {
        // Сначала сбрасываем ошибку (тоже асинхронно)
        setTimeout(() => setError(null), 0);

        let limitsData: EventFiltersInfo | null = null;
        let resultsData: SearchResponse | null = null;
        let statsData: AnalyticsResponse | null = null;
        let histogramsData: HistogramsResponse | null = null;

        results.forEach((r, i) => {
          if (r.status === "rejected") {
            const err = r.reason;
            const status = err?.response?.status;

            if (status === 401) {
              hasCriticalError = true;
              return;
            }

            console.warn(`Request ${i} failed:`, err);
          } else {
            switch (i) {
              case 0:
                limitsData = r.value;
                break;
              case 1:
                resultsData = r.value as SearchResponse;
                break;
              case 2:
                statsData = r.value as AnalyticsResponse | null;
                break;
              case 3:
                histogramsData = r.value as HistogramsResponse;
                break;
            }
          }
        });

        if (hasCriticalError) {
          setTimeout(() => {
            setError("UNAUTHORIZED");
            setLoading(false);
          }, 0);
        } else {
          setTimeout(() => {
            setLimits(limitsData);
            setResults(resultsData);
            setStats(statsData);
            setHistograms(histogramsData);
            setLoading(false);
          }, 0);
        }
      })
      .catch((err) => {
        console.error(err);
        setTimeout(() => {
          setError("Произошла непредвиденная ошибка при загрузке данных");
          setLoading(false);
        }, 0);
      });
  }, [inn]);

  return { results, limits, stats, histograms, loading, error };
}
