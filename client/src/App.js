
import './App.css';
import "primereact/resources/themes/lara-light-indigo/theme.css";  //theme
import "primereact/resources/primereact.min.css";                  //core css
import "primeicons/primeicons.css";
import "/node_modules/primeflex/primeflex.css"
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useEffect, useState, useContext } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import Main from './routes/main';
import JustLogggedContext from './contexts/just-logged';



function App() {
  const [justLogged, setJustLogged] = useState(false)
  useContext(JustLogggedContext)
  const [displayLogin, setDisplayLogin] = useState(false);
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
    window.open(log.data, 'Spotify Login', 'toolbar=no,location=no,directories=no,status=no, menubar=no,scrollbars=no,resizable=no,width=300,height=600')
  };

  useEffect(() => {
    if (!cookies.spotify) {
      login()
    }
  }, [cookies])

  useEffect(() => {
    if (justLogged) {
      window.location.reload()
    }
  }, [justLogged])


  return (
    <div className="App">
      <header className="App-header">
        <Dialog
          header="Spotify Login"
          visible={displayLogin}
          style={{ width: '50vw' }}
          onHide={() => setDisplayLogin(false)}
        >
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
        <JustLogggedContext.Provider value={[justLogged, setJustLogged]}>
          <Main></Main>
        </JustLogggedContext.Provider>
      </header>
    </div>
  );
}

export default App;
