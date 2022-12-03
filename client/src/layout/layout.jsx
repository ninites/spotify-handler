import { Outlet } from "react-router-dom";
import { Menubar } from "primereact/menubar";
import "./layout.css";
import { useNavigate } from "react-router-dom";

import { useCallback, useContext } from "react";

import LoginStatusContext from "../contexts/login-status-context";

import MenuRight from "./menu-right";

const Layout = () => {
  const [loginStatus, setLoginStatus] = useContext(LoginStatusContext);
  const navigate = useNavigate();

  const computeMenu = useCallback(() => {
    const redirect = (url) => {
      navigate(url);
    };

    const items = [
      {
        label: "Playlists",
        command: () => redirect("playlists"),
        disabled: !loginStatus.app || !loginStatus.spotify,
      },
    ];

    return items;
  }, [loginStatus.app, loginStatus.spotify, navigate]);

  return (
    <div>
      <Menubar
        style={{ zIndex: 10 }}
        model={computeMenu()}
        className="top-bar-menu"
        end={<MenuRight loginState={[loginStatus, setLoginStatus]} />}
      ></Menubar>
      <div className="layout-center">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
