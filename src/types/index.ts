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

// Типы для поиска
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
  inn?: string | null;
  sparkId?: number | null;
  entityId?: number | null;
  inBusinessNews?: boolean | null;
  maxFullness?: boolean | null;
}

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
      riskFactors: { and: any[]; or: any[]; not: any[] };
      themes: { and: []; or: []; not: [] };
    };
    searchEntitiesFilter: {
      and: any[];
      or: any[];
      not: any[];
    };
    locationsFilter: { and: any[]; or: any[]; not: any[] };
    themesFilter: { and: any[]; or: any[]; not: any[] };
  };
  searchArea: {
    includedSources: number[];
    excludedSources: number[];
    includedSourceGroups: number[];
    excludedSourceGroups: number[];
    includedDistributionMethods: number[];
    excludedDistributionMethods: [];
  };
  attributeFilters: {
    excludeTechNews: boolean;
    excludeAnnouncements: boolean;
    excludeDigests: boolean;
  };
  similarMode: "None" | "Cluster" | "Document";
  intervalType: "Day" | "Week" | "Month";
  limit: number;
  sortType: "None" | "Influence" | "Date";
  sortDirectionType: "Asc" | "Desc";
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
  description: string;
  icon: string; // можно использовать эмодзи или код иконки
}
