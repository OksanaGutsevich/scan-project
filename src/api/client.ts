import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api", // в vite.config.ts будет прокси на http://localhost:3000
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

export default apiClient;
