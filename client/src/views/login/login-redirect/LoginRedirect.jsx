import { useEffect } from "react";
import { useCookies } from "react-cookie";

const LoginRedirect = () => {
  const [cookies, setCookie] = useCookies(["spotify"]);

  const closeWindow = () => {
    if(cookies.spotify) {
      window.opener.location = "/";
      window.close();
    }
  };

  useEffect(() => {
    closeWindow();
  }, []);

  return <div></div>;
};

export default LoginRedirect;
