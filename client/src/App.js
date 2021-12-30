import "./App.css";
import "primereact/resources/themes/lara-light-indigo/theme.css"; //theme
import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css";
import "/node_modules/primeflex/primeflex.css";
import { useCookies } from "react-cookie";
import axios from "axios";
import Main from "./routes/main";
import { ConfirmDialog } from "primereact/confirmdialog";
import { useState } from "react";

function App() {
  const [cookies, setCookie] = useCookies(["spotify", "app"]);
  const [errorDialog, setErrorDialog] = useState({
    display: false,
    message: "",
  });

  axios.interceptors.request.use(
    function (config) {
      const tokens = {};

      if (cookies.app) {
        tokens.app = cookies.app;
      }

      if (cookies.spotify) {
        tokens.spotify = cookies.spotify;
      }
      const authValue = "Bearer " + JSON.stringify(tokens);
      config.headers["authorization"] = authValue;
      return config;
    },
    function (error) {
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    function (response) {
      return response;
    },
    function (error) {
      setErrorDialog({
        display: true,
        message: "Erreur inattendue",
      });
      return Promise.reject(error);
    }
  );

  return (
    <div className="App">
      <header className="App-header">
        <ConfirmDialog
          visible={errorDialog.display}
          onHide={() => setErrorDialog({ display: false, message: "" })}
          message={errorDialog.message}
        />
        <Main />
      </header>
    </div>
  );
}

export default App;
