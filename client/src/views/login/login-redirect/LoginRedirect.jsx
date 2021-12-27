import { useEffect } from "react";

const LoginRedirect = () => {
  const closeWindow = () => {
    window.close();
  };

  useEffect(() => {
    closeWindow();
  }, []);

  return <div></div>;
};

export default LoginRedirect;
