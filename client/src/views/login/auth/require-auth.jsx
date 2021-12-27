import { Navigate } from "react-router-dom";
import { useCookies } from 'react-cookie';


const RequireAuth = ({ children, redirectTo }) => {
    const [cookies, setCookie] = useCookies(['spotify']);
    return cookies.spotify ? children : <Navigate to={redirectTo} />;
}

export default RequireAuth