import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const token = localStorage.getItem("accessToken");

  if (!token) {
    // Редирект на страницу авторизации, но запоминаем, куда хотел попасть пользователь
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
