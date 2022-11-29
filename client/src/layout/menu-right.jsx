import { Button } from 'primereact/button';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AutoComplete } from 'primereact/autocomplete';
import { useCookies } from 'react-cookie';
import useRequest from '../customhooks/useRequest';
import useWindowSize from '../customhooks/useWindowSize';
import { BREAKPOINT } from '../global/variables';

const MenuRight = ({ loginState }) => {
  const [loginStatus, setLoginStatus] = loginState;
  const [cookies, setCookie, removeCookie] = useCookies(['spotify', 'app']);
  const [searchSuggestions] = useState([]);
  const [searchArtist, setSearchArtist] = useState('');
  const navigate = useNavigate();
  const spotifyUserInfos = useRequest('get', '/spotify/user-infos');
  const [spotifyUser, setSpotifyUser] = useState({});
  const windowSize = useWindowSize();

  const redirect = (url) => {
    navigate(url);
  };

  const logOut = () => {
    removeCookie('spotify');
    removeCookie('app');
    setLoginStatus({ app: false, spotify: false });
    navigate('login');
  };

  useEffect(() => {
    setSpotifyUser(spotifyUserInfos.data.body);
  }, [spotifyUserInfos]);

  return (
    <div className="flex">
      {!loginStatus.app && (
        <Button
          icon="pi pi-fw pi-sign-in"
          className="p-button-success"
          onClick={() => redirect('login')}
          style={
            !loginStatus.app && !loginStatus.spotify
              ? { marginRight: '0.5rem' }
              : {}
          }
        />
      )}
      {!loginStatus.app && !loginStatus.spotify && (
        <Button label="Inscription" onClick={() => redirect('subscribe')} />
      )}
      {loginStatus.app && !loginStatus.spotify && (
        <Button
          label="Spotify"
          //   icon="pi pi-fw pi-sign-in"
          onClick={() => redirect('login/spotify')}
          style={{ marginRight: '0.5rem' }}
        />
      )}
      {loginStatus.app && (
        <Button
          icon="pi pi-fw pi-sign-out"
          className="p-button-danger"
          onClick={logOut}
        />
      )}
    </div>
  );
};

export default MenuRight;
