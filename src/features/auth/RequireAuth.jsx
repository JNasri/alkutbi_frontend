import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { normalizeRoles } from "../../config/roles";

const RequireAuth = ({ allowedRoles }) => {
  const location = useLocation();
  const { roles } = useAuth();
  const normalizedAllowedRoles = normalizeRoles(allowedRoles);

  const content = roles.some((role) => normalizedAllowedRoles.includes(role)) ? (
    <Outlet />
  ) : (
    <Navigate to="/dashboard" state={{ from: location }} replace />
  );

  return content;
};

export default RequireAuth;
