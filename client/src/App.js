
import Artist from './views/Artist';
import './App.css';
import "primereact/resources/themes/lara-light-indigo/theme.css";  //theme
import "primereact/resources/primereact.min.css";                  //core css
import "primeicons/primeicons.css";

function App() {

  return (
    <div className="App">
      <header className="App-header">
        <Artist></Artist>
      </header>
    </div>
  );
}

export default App;
