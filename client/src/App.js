import './App.css';
import "primereact/resources/themes/lara-light-indigo/theme.css";  //theme
import "primereact/resources/primereact.min.css";                  //core css
import "primeicons/primeicons.css";
import "/node_modules/primeflex/primeflex.css"
import { useCookies } from 'react-cookie';
import axios from 'axios';
import Main from './routes/main';



function App() {
  const [cookies, setCookie] = useCookies(['spotify']);

  axios.interceptors.request.use(function (config) {
    config.headers['authorization'] = "Bearer " + cookies.spotify
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  });



  return (
    <div className="App">
      <header className="App-header">
        <Main></Main>
      </header>
    </div>
  );
}

export default App;
