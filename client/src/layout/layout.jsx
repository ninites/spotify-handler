import { Outlet } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import './layout.css';
import { useNavigate } from 'react-router-dom';

import { useContext, useEffect, useRef } from 'react';

import LoginStatusContext from '../contexts/login-status-context';

import MenuRight from './menu-right';

const Layout = () => {
  const [loginStatus, setLoginStatus] = useContext(LoginStatusContext);
  const navigate = useNavigate();

  const redirect = (url) => {
    navigate(url);
  };

  const computeMenu = () => {
    const items = [
      {
        label: 'Mes artistes',
        // icon: 'pi pi-fw pi-star',
        command: () => redirect('artists'),
        disabled: !loginStatus.app || !loginStatus.spotify,
      },
      {
        label: 'Les sorties',
        // icon: 'pi pi-fw pi-star',
        command: () => redirect('new-releases'),
        disabled: !loginStatus.app || !loginStatus.spotify,
      },
    ];

    return items;
  };

  useEffect(() => {
    computeMenu();
  }, [loginStatus]);

  return (
    <div>
      <Menubar
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
