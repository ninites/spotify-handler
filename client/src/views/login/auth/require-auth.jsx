import { Navigate } from "react-router-dom";
import { useCookies } from "react-cookie";

const RequireAuth = ({ children, redirectTo, type }) => {
  const [cookies, setCookie] = useCookies(["spotify", "app"]);
  const cookieType = type === "spotify" ? cookies.spotify : cookies.app;
  return cookieType ? children : <Navigate to={redirectTo} />;
};

export default RequireAuth;
