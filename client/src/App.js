
import './App.css';
import "primereact/resources/themes/lara-light-indigo/theme.css";  //theme
import "primereact/resources/primereact.min.css";                  //core css
import "primeicons/primeicons.css";
import "/node_modules/primeflex/primeflex.css"
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ArtistsList from './views/ArtistsList';
import Artist from './views/Artist';


function App() {
  const [displayLogin, setDisplayLogin] = useState(false);
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [cookies, setCookie] = useCookies(['spotify']);
  const [errorDialog, setErrorDialog] = useState({
    display: false,
    message: '',
  });

  axios.interceptors.request.use(function (config) {
    config.headers['authorization'] = "Bearer " + cookies.spotify
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  });

  const login = async () => {
    setDisplayLogin(true);
  };

  const launchLog = async () => {
    const log = await axios.get('http://localhost:3000/spotify/login');

    setSpotifyUrl(log.data);
    setDisplayLogin(false);
  };

  useEffect(() => {
    if (!cookies.spotify) {
      login()
    }
  }, [cookies])



  return (
    <div className="App">
      <header className="App-header">
        <Dialog
          header="Spotify Login"
          visible={displayLogin}
          style={{ width: '50vw' }}
          onHide={() => setDisplayLogin(false)}
        >
          {spotifyUrl && (
            <iframe
              id="inlineFrameExample"
              title="Inline Frame Example"
              width="300"
              height="200"
              src={spotifyUrl}
            ></iframe>
          )}
          <Button label="Login to spotify" onClick={launchLog} />
        </Dialog>

        <Dialog
          header="Error"
          visible={errorDialog.display}
          style={{ width: '50vw' }}
          onHide={() => setErrorDialog({ display: false, message: '' })}
        >
          {errorDialog.message}
        </Dialog>
        <BrowserRouter>
          <Routes>
            <Route path="artists" element={<ArtistsList />} />
            <Route path="artists/:id" element={<Artist />} />

          </Routes>
        </BrowserRouter>
      </header>
    </div>
  );
}

export default App;
