// src/routes.tsx
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { AuthPage } from "./pages/AuthPage";
import SearchFormPage from "./pages/SearchFormPage";
import ResultsPage from "./pages/ResultsPage";
import PublicationDetailPage from "./pages/PublicationDetailPage"; // <-- подключаем страницу
import { ProtectedRoute } from "./components/ProtectedRoute";

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/auth" element={<AuthPage />} />

    {/* Защищённые роуты: доступ только при наличии accessToken */}
    <Route
      path="/search"
      element={
        <ProtectedRoute>
          <SearchFormPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/results"
      element={
        <ProtectedRoute>
          <ResultsPage />
        </ProtectedRoute>
      }
    />

    {/* Страница детальной публикации — тоже под защитой, как и результаты */}
    <Route
      path="/publication/:id"
      element={
        <ProtectedRoute>
          <PublicationDetailPage />
        </ProtectedRoute>
      }
    />
  </Routes>
);
