import { Navigate } from "react-router-dom";
import { useCookies } from 'react-cookie';


const RequireAuthSpotify = ({ children, redirectTo }) => {
    const [cookies, setCookie] = useCookies(['spotify']);
    return cookies.spotify ? children : <Navigate to={redirectTo} />;
}

export default RequireAuthSpotify