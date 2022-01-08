import { Button } from 'primereact/button';
import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AutoComplete } from 'primereact/autocomplete';
import ArtistContext from '../contexts/artists-context';
import { useCookies } from 'react-cookie';
import useRequest from '../customhooks/useRequest';
import useWindowSize from '../customhooks/useWindowSize';
import { BREAKPOINT } from '../global/variables';

const MenuRight = ({ loginState }) => {
  const [loginStatus, setLoginStatus] = loginState;
  const [cookies, setCookie, removeCookie] = useCookies(['spotify', 'app']);
  const [artists] = useContext(ArtistContext);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searchArtist, setSearchArtist] = useState('');
  const navigate = useNavigate();
  const spotifyUserInfos = useRequest('get', '/spotify/user-infos');
  const [spotifyUser, setSpotifyUser] = useState({});
  const windowSize = useWindowSize();

  const redirect = (url) => {
    navigate(url);
  };

  const goToSelectedArtist = (name) => {
    const artistToGo = findArtist(name);
    const url = 'artists/' + artistToGo.id;
    navigate(url);
  };

  const findArtist = (name) => {
    return artists.find((artist) => {
      return artist.name === name;
    });
  };

  const autoCompleteItemTemplate = (item) => {
    const artist = findArtist(item);
    return (
      <div className="flex">
        {windowSize.width > BREAKPOINT.phone && (
          <div
            className="w-2 flex-initial flex align-items-center justify-content-center mr-2 bg-no-repeat bg-cover bg-center"
            style={{
              backgroundImage: `url(${artist.images[0].url})`,
            }}
          ></div>
        )}
        <p className="flex-initial flex align-items-center justify-content-center">
          {artist.name}
        </p>
      </div>
    );
  };

  const createSuggestions = (event) => {
    let _filteredArtists;
    if (!event.query.trim().length) {
      _filteredArtists = [...artists];
    } else {
      _filteredArtists = artists
        .map((artist) => {
          const nameMatch = artist.name
            .toLowerCase()
            .startsWith(event.query.toLowerCase());
          if (nameMatch) {
            return artist.name;
          } else {
            return '';
          }
        })
        .filter((artist) => artist);
    }
    setSearchSuggestions(_filteredArtists);
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
      {loginStatus.app && loginStatus.spotify && (
        <div className="flex align-items-center">
          <AutoComplete
            style={{ marginRight: '0.5rem' }}
            size={windowSize.width > BREAKPOINT.phone ? 25 : 10}
            scrollHeight="300px"
            value={searchArtist}
            placeholder="Artiste"
            suggestions={searchSuggestions}
            completeMethod={createSuggestions}
            field="Artiste"
            itemTemplate={autoCompleteItemTemplate}
            onChange={(e) => setSearchArtist(e.value)}
            onSelect={(e) => {
              goToSelectedArtist(e.value);
            }}
          />
          {spotifyUser && spotifyUser.images && spotifyUser.images.length > 0 && (
            <img
              src={spotifyUser.images[0].url}
              alt="userProfileImage"
              style={{
                height: '2.7rem',
                marginRight: '0.5rem',
                borderRadius: '4px',
              }}
            />
          )}
        </div>
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
