import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginRedirect from "../views/login/logins/login-redirect.jsx";
import Layout from "../layout/layout";
import RequireAuth from "../views/login/auth/require-auth";
import LoginSpotify from "../views/login/logins/login-spotify";
import { useContext, useEffect, useState, useRef } from "react";
import LoginStatusContext from "../contexts/login-status-context";
import { useCookies } from "react-cookie";
import Login from "../views/login/logins/login";
import NoAuth from "../views/login/auth/no-auth";
import FullAppLoadingContext from "../contexts/full-app-loading";
import Subscribe from "../views/subscribe/subscribe";
import ToasterContext from "../contexts/toaster-context";
import { Toast } from "primereact/toast";
import Playlists from "../views/playlists/Playlists.jsx";
import PlaylistAlbum from "../views/playlists/PlaylistAlbums.jsx";
import Konami from "../views/konami/Konami.jsx";

const Main = () => {
  const [cookies, setCookie] = useCookies(["spotify", "app"]);

  const [loginStatus, setLoginStatus] = useState({
    app: false,
    spotify: false,
  });

  const [fullAppLoading, setFullAppLoading] = useState(true);

  const toast = useRef(null);

  useEffect(() => {
    const gotSpotifyCookie = cookies.spotify ? true : false;
    const gotAppCookie = cookies.app ? true : false;
    setLoginStatus({ app: gotAppCookie, spotify: gotSpotifyCookie });
  }, [cookies]);

  useContext(LoginStatusContext);
  useContext(FullAppLoadingContext);
  useContext(ToasterContext);

  return (
    <BrowserRouter>
      <FullAppLoadingContext.Provider value={fullAppLoading}>
        <ToasterContext.Provider value={toast}>
          <LoginStatusContext.Provider value={[loginStatus, setLoginStatus]}>
            <Toast ref={toast}></Toast>
            <Routes>
              <Route element={<Layout />}>
                <Route path="login-redirect" element={<LoginRedirect />} />
                <Route
                  path="login"
                  element={
                    <NoAuth>
                      <Login />
                    </NoAuth>
                  }
                />
                <Route
                  path="subscribe"
                  element={
                    <NoAuth>
                      <Subscribe />
                    </NoAuth>
                  }
                />
                <Route
                  path="login/spotify"
                  element={
                    <RequireAuth type={"app"}>
                      <LoginSpotify />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/playlists"
                  element={
                    <RequireAuth type={"full"}>
                      <Playlists></Playlists>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/playlists/:id"
                  element={
                    <RequireAuth type={"full"}>
                      <PlaylistAlbum></PlaylistAlbum>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/konami"
                  element={
                    <RequireAuth type={"full"}>
                      <Konami></Konami>
                    </RequireAuth>
                  }
                />
                <Route path="/" element={<Navigate to="/playlists" />} />
                <Route path="*" element={<Navigate to="/playlists" />} />
              </Route>
            </Routes>
          </LoginStatusContext.Provider>
        </ToasterContext.Provider>
      </FullAppLoadingContext.Provider>
    </BrowserRouter>
  );
};

export default Main;
