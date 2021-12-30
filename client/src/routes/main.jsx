import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ArtistsList from "../views/artists/ArtistsList";
import Artist from "../views/artists/Artist";
import LoginRedirect from "../views/login/logins/login-redirect.jsx";
import Layout from "../layout/layout";
import RequireAuth from "../views/login/auth/require-auth";
import LoginSpotify from "../views/login/logins/login-spotify";
import { useContext, useEffect, useState } from "react";
import ArtistContext from "../contexts/artists-context";
import useRequest from "../customhooks/useRequest";
import Releases from "../views/releases/releases";
import ReleasesContext from "../contexts/releases-context";
import LoginStatusContext from "../contexts/login-status-context";
import { useCookies } from "react-cookie";
import Login from "../views/login/logins/login";

const Main = () => {
  const [cookies, setCookie] = useCookies(["spotify", "app"]);

  const [loginStatus, setLoginStatus] = useState({
    app: false,
    spotify: false,
  });

  const [releases, setReleases] = useState([]);
  const [refetchReleases, setRefetchReleases] = useState(false);
  const newReleasesResponse = useRequest(
    "get",
    "/spotify/new-releases",
    refetchReleases
  );

  const [artists, setArtists] = useState([]);
  const artistsRequest = useRequest("get", "/spotify/followed-artists");

  useEffect(() => {
    const gotAnswer = artistsRequest.data.length !== 0;
    if (gotAnswer) {
      const { artists } = artistsRequest.data.body;
      setArtists(artists.items);
    }
  }, [artistsRequest]);

  useEffect(() => {
    setReleases(newReleasesResponse.data);
  }, [newReleasesResponse]);

  useEffect(() => {
    const gotSpotifyCookie = cookies.spotify ? true : false;
    const gotAppCookie = cookies.app ? true : false;
    setLoginStatus({ app: gotAppCookie, spotify: gotSpotifyCookie });
  }, [cookies]);

  useContext(ArtistContext);
  useContext(ReleasesContext);
  useContext(LoginStatusContext);

  return (
    <BrowserRouter>
      <LoginStatusContext.Provider value={[loginStatus, setLoginStatus]}>
        <ArtistContext.Provider value={[artists, setArtists]}>
          <ReleasesContext.Provider
            value={{
              data: [releases, setReleases],
              refresh: [refetchReleases, setRefetchReleases],
            }}
          >
            <Routes>
              <Route element={<Layout />}>
                <Route path="login-redirect" element={<LoginRedirect />} />
                <Route
                  path="login/spotify"
                  element={
                    <RequireAuth redirectTo="/login" type="app">
                      <LoginSpotify />
                    </RequireAuth>
                  }
                />
                <Route path="login" element={<Login />} />
                <Route
                  path="/artists"
                  element={
                    <RequireAuth redirectTo="/login/spotify" type="spotify">
                      <ArtistsList />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/artists/:id"
                  element={
                    <RequireAuth redirectTo="/login/spotify" type="spotify">
                      <Artist />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/new-releases"
                  element={
                    <RequireAuth redirectTo="/login/spotify" type="spotify">
                      <Releases />
                    </RequireAuth>
                  }
                />
                <Route path="/" element={<Navigate to="/artists" />} />
                <Route path="*" element={<Navigate to="/artists" />} />
              </Route>
            </Routes>
          </ReleasesContext.Provider>
        </ArtistContext.Provider>
      </LoginStatusContext.Provider>
    </BrowserRouter>
  );
};

export default Main;
