import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { Button } from "primereact/button";

const LoginSpotify = () => {
  const [cookies, setCookie] = useCookies(["spotify"]);
  const navigate = useNavigate();

  const launchLog = async () => {
    if (!cookies.spotify) {
      const log = await axios.get("/auth/spotify/login");
      window.open(
        log.data,
        "Spotify Login",
        "toolbar=no,location=no,directories=no,status=no, menubar=no,scrollbars=no,resizable=no,width=300,height=600"
      );
    } else {
      navigate("/artists");
    }
  };

  return (
    <div>
      <div className="mt-5">
        <Button label="Se Connecter à mon compte Spotify" onClick={launchLog} />
      </div>
    </div>
  );
};

export default LoginSpotify;
