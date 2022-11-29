import { Navigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';

const RequireAuth = ({ children, type }) => {
  const [cookies] = useCookies(['spotify', 'app']);

  const fullAuth = () => {
    if (!cookies.app) {
      return <Navigate to={'/login'} />;
    }

    if (!cookies.spotify) {
      return <Navigate to={'/login/spotify'} />;
    }

    return children;
  };

  const appAuth = () => {
    if (!cookies.app) {
      return <Navigate to={'/login'} />;
    }

    if (cookies.app && cookies.spotify) {
      return <Navigate to={'/artists'} />;
    }

    return children;
  };

  switch (type) {
    case 'full':
      return fullAuth();
    case 'app':
      return appAuth();
    default:
      break;
  }
};

export default RequireAuth;
