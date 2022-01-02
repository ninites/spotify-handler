import { Navigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';

const NoAuth = ({ children }) => {
  const [cookies, setCookie] = useCookies(['spotify', 'app']);

  if (cookies.app || cookies.spotify) {
    return <Navigate to={'/artists'} />;
  }

  return children;
};

export default NoAuth;
