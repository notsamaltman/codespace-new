import { Navigate, Outlet } from "react-router-dom";

const isAuthenticated = () => {
  return Boolean(localStorage.getItem("token"));
};

export const RequireAuth = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  return <Outlet />;
};
