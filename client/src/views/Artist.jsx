import { useEffect, useState } from 'react';
import axios from 'axios';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useCookies } from 'react-cookie';
import { Card } from 'primereact/card';

const Artist = () => {
  const [artists, setArtists] = useState([]);
  const [displayLogin, setDisplayLogin] = useState(false);
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [cookies, setCookie] = useCookies(['spotify']);
  const [errorDialog, setErrorDialog] = useState({
    display: false,
    message: '',
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
    if (cookies.spotify) {
      const missingAlbums = async () => {
        const url = 'http://localhost:3000/spotify/user/missing-album';
        const headers = {
          authorization: 'Bearer ' + cookies.spotify,
        };
        try {
          const response = await axios.get(url, { headers: headers });
          console.log(response);
          setArtists(response.data);
        } catch (err) {
          console.log(err);
          setErrorDialog({
            display: true,
            message: err.message,
          });
        }
      };
      missingAlbums();
    } else {
      login();
    }
  }, [cookies]);

  return (
    <div>
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
      {artists
        .filter((data) => data.artist_missing_albums.length > 0)
        .map((artist) => {
          return (
            <div key={artist.artist.id}>
              <Card
              // header={<img alt="Card" src={artist.artist.name} />}
              >
                {artist.artist.name}
              </Card>
            </div>
          );
        })}
    </div>
  );
};

export default Artist;
