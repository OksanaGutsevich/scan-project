// src/api/client.ts
import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://gateway.scan-interfax.ru", // полный базовый URL
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Перехватчик: автоматически подставляет Authorization, если токен есть
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Опционально: перехватчик ошибок для удобной обработки на фронтенде
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Формируем понятный объект ошибки, чтобы в AuthPage было что показать
    if (error.response) {
      // Сервер ответил (например, 401, 403, 400)
      throw {
        response: {
          data: error.response.data,
          status: error.response.status,
        },
      };
    } else if (error.request) {
      // Запрос ушёл, но ответа нет (сеть, CORS, таймаут)
      throw new Error("Нет соединения с сервером авторизации");
    }
    throw error;
  },
);

export default apiClient;
