// src/mocks/mockData.ts
import type {
  SearchResponse,
  AnalyticsResponse,
  IntervalPoint,
  ScanDoc,
  WhyWeCard,
} from "../types";

export const MOCK_SEARCH_RESPONSE: SearchResponse = {
  items: [
    { encodedId: "pub-001", influence: 87, similarCount: 3 },
    { encodedId: "pub-002", influence: 42, similarCount: 0 },
    { encodedId: "pub-003", influence: 95, similarCount: 7 },
  ],
  mappings: [],
};

export const MOCK_ANALYTICS: AnalyticsResponse = {
  points: [
    { date: "2024-07-01T00:00:00Z", value: 12 },
    { date: "2024-07-02T00:00:00Z", value: 5 },
    { date: "2024-07-03T00:00:00Z", value: 23 },
  ] as IntervalPoint[],
};

export const MOCK_SCANDOC: ScanDoc = {
  schemaVersion: "1.0",
  id: "pub-001",
  version: 1,
  issueDate: "2024-07-02T14:30:00Z",
  url: "https://example.com/news/123",
  author: { name: "Иван Петров" },
  source: {
    id: 101,
    name: "Деловой Петербург",
    categoryId: 1,
    levelId: 2,
    groupId: 3,
  },
  dedupClusterId: "cluster-abc",
  title: {
    text: "Рост выручки компании X на 15%",
    markup: "<b>Рост выручки компании X на 15%</b>",
  },
  content: {
    markup:
      "В этом квартале компания X показала рост выручки на 15% благодаря расширению сети филиалов. Аналитики отмечают устойчивый тренд на рост в сегменте B2B.",
  },
  attributes: {
    isTechNews: false,
    isAnnouncement: false,
    isDigest: false,
    wordCount: 47,
  },
  language: "Russian",
};

export const WHY_WE_CARDS: WhyWeCard[] = [
  {
    id: "card-1",
    title: "Быстрый поиск по ИНН",
    description:
      "Находите публикации о компании за считанные секунды — система анализирует тысячи источников.",
    icon: "⚡",
  },
  {
    id: "card-2",
    title: "Фильтрация по тональности",
    description:
      "Отделяйте нейтральные упоминания от позитивных и негативных — это важно для репутационного анализа.",
    icon: "🎯",
  },
  {
    id: "card-3",
    title: "Аналитика и статистика",
    description:
      "Смотрите динамику упоминаний по дням, источникам и темам — всё в наглядных графиках.",
    icon: "📈",
  },
];
