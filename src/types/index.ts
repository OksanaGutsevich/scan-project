// src/types/index.ts

export interface LoginRequest {
  login: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expire: string;
}

export interface EventFiltersInfo {
  usedCompanyCount: number;
  companyLimit: number;
}

export interface AccountInfoResponse {
  eventFiltersInfo: EventFiltersInfo;
}

// Типы для аналитики
export interface IntervalPoint {
  date: string; // ISO date-time
  value: number;
}

export interface AnalyticsResponse {
  points: IntervalPoint[];
}

// Типы для поиска POST /api/v1/objectsearch
export interface SearchResultItem {
  encodedId: string;
  influence: number;
  similarCount: number;
}

export interface MappingItem {
  inn: string;
  entityIds: number[];
}

export interface SearchResponse {
  items: SearchResultItem[];
  mappings: MappingItem[];
}

export type TonalityOption = "any" | "negative" | "positive";

export interface TargetSearchEntity {
  type: "company" | "suggestedPersons";
  inn?: string | number; // Теперь поддерживает и строку, и число
  sparkId?: number | null;
  entityId?: number | null;
  inBusinessNews?: boolean | null;
  maxFullness?: boolean | null;
}

export type SortTypeOption =
  | "None"
  | "sourceInfluence"
  | "issueDate"
  | "relevance";

export type SortDirectionOption = "asc" | "desc";

export type IntervalTypeOption = "day" | "week" | "month";
export interface SearchPayload {
  issueDateInterval: {
    startDate: string;
    endDate: string;
  };
  searchContext: {
    targetSearchEntitiesContext: {
      targetSearchEntities: TargetSearchEntity[];
      onlyMainRole: boolean;
      onlyWithRiskFactors: boolean;
      tonality: TonalityOption;
      riskFactors: { and: unknown[]; or: unknown[]; not: unknown[] };
      themes: { and: unknown[]; or: unknown[]; not: unknown[] };
    };
    searchEntitiesFilter: {
      and: unknown[];
      or: unknown[];
      not: unknown[];
    };
    locationsFilter: {
      and: unknown[];
      or: unknown[];
      not: unknown[];
    };
    themesFilter: {
      and: unknown[];
      or: unknown[];
      not: unknown[];
    };
  };
  searchArea: {
    includedSources: number[];
    excludedSources: number[];
    includedSourceGroups: number[];
    excludedSourceGroups: number[];
    includedDistributionMethods: number[];
    excludedDistributionMethods: number[];
  };
  attributeFilters: {
    excludeTechNews: boolean;
    excludeAnnouncements: boolean;
    excludeDigests: boolean;
  };
  similarMode: "None" | "Cluster" | "Document" | "duplicates"; // добавь "duplicates"
  intervalType: IntervalTypeOption;
  limit: number;
  sortType: SortTypeOption; // исправлено
  sortDirectionType: SortDirectionOption; // исправлено
}

// 🔥 Типы строго под твой ответ API
export interface HistogramPoint {
  date: string; // "2020-11-01T03:00:00+03:00"
  value: number; // 8, 6, 0, 1
}

export interface HistogramSeries {
  data: HistogramPoint[];
  histogramType: "totalDocuments" | "riskFactors";
}

export interface HistogramResponse {
  data: HistogramSeries[];
}

export interface HistogramSearchPayload {
  issueDateInterval: {
    startDate: string;
    endDate: string;
  };
  searchContext: {
    targetSearchEntitiesContext: {
      targetSearchEntities: TargetSearchEntity[];
      onlyMainRole: boolean;
      onlyWithRiskFactors: boolean;
      tonality: TonalityOption;
      riskFactors: { and: unknown[]; or: unknown[]; not: unknown[] };
      themes: { and: unknown[]; or: unknown[]; not: unknown[] };
    };
  };
  intervalType: IntervalTypeOption; // исправлено
  histogramTypes: ("totalDocuments" | "riskFactors")[];
  similarMode: "None" | "Cluster" | "Document" | "duplicates";
  limit?: number;
  sortType?: SortTypeOption; // если используется
  sortDirectionType?: SortDirectionOption; // если используется
  attributeFilters?: {
    excludeTechNews?: boolean;
    excludeAnnouncements?: boolean;
    excludeDigests?: boolean;
  };
}

// --- Типы ScanDoc (полная публикация) ---

export interface DocumentAuthor {
  name: string;
}

export interface DocumentSource {
  id: number;
  name: string;
  categoryId: number;
  levelId: number;
  groupId: number;
}

export interface DocumentTitle {
  text: string;
  markup: string;
}

export interface DocumentContent {
  markup: string;
}

export interface DocumentAttributes {
  isTechNews: boolean;
  isAnnouncement: boolean;
  isDigest: boolean;
  wordCount: number;
}

export interface ScanDoc {
  schemaVersion: string;
  id: string;
  version: number;
  issueDate: string; // date-time ISO
  url: string;
  author: DocumentAuthor;
  source: DocumentSource;
  dedupClusterId: string;
  title: DocumentTitle;
  content: DocumentContent;
  entities?: never; // не используется в проекте
  attributes: DocumentAttributes;
  language: "Russian" | "other" | "unknown";
}

export interface WhyWeCard {
  id: string;
  title: string;
  icon: string; // можно использовать эмодзи или код иконки
}
