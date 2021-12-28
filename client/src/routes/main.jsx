import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ArtistsList from "../views/artists/ArtistsList";
import Artist from "../views/artists/Artist";
import LoginRedirect from "../views/login/login-redirect/LoginRedirect.jsx";
import Layout from "../layout/Layout";
import RequireAuth from "../views/login/auth/require-auth";
import Login from "../views/login/login-redirect/login";
import { useContext, useEffect, useState } from "react";
import ArtistContext from "../contexts/artists-context";
import useRequest from "../customhooks/useRequest";
import Releases from "../views/releases/releases";

const Main = () => {
  const [artists, setArtists] = useState([]);
  const artistsRequest = useRequest("get", "/spotify/user/artists");

  useEffect(() => {
    const gotAnswer = artistsRequest.data.length !== 0;
    if (gotAnswer) {
      const { artists } = artistsRequest.data.body;
      setArtists(artists.items);
    }
  }, [artistsRequest]);

  useContext(ArtistContext);
  return (
    <BrowserRouter>
      <ArtistContext.Provider value={[artists, setArtists]}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="login-redirect" element={<LoginRedirect />} />
            <Route path="login" element={<Login />} />
            <Route
              path="/artists"
              element={
                <RequireAuth redirectTo="/login">
                  <ArtistsList />
                </RequireAuth>
              }
            />
            <Route
              path="/artists/:id"
              element={
                <RequireAuth redirectTo="/login">
                  <Artist />
                </RequireAuth>
              }
            />
            <Route
              path="/new-releases"
              element={
                <RequireAuth redirectTo="/login">
                  <Releases />
                </RequireAuth>
              }
            />
            <Route path="/" element={<Navigate to="/artists" />} />
            <Route path="*" element={<Navigate to="/artists" />} />
          </Route>
        </Routes>
      </ArtistContext.Provider>
    </BrowserRouter>
  );
};

export default Main;
