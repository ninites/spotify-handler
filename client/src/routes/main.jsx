import { BrowserRouter, Routes, Route } from "react-router-dom";
import ArtistsList from "../views/artists/ArtistsList";
import Artist from "../views/artists/Artist";
import LoginRedirect from "../views/login/login-redirect/LoginRedirect.jsx";
import Layout from "../layout/Layout";
import RequireAuth from "../views/login/auth/require-auth";
import Login from "../views/login/login-redirect/login";

const Main = () => {
  return (
    <BrowserRouter>
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
          ></Route>
          <Route
            path="/artists/:id"
            element={
              <RequireAuth redirectTo="/login">
                <Artist />
              </RequireAuth>
            }
          ></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Main;
