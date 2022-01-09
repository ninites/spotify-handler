import { Card } from 'primereact/card';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { useState, useRef, useContext, useEffect } from 'react';
import axios from 'axios';
import ReleasesContext from '../../contexts/releases-context';
import { BREAKPOINT } from '../../global/variables';
import useWindowSize from '../../customhooks/useWindowSize';
import ToasterContext from '../../contexts/toaster-context';

const CARD_STYLE = {
  desktop: { width: '20rem', height: '350px' },
  phone: { width: '96vw', height: '350px' },
};

const AlbumCard = ({ album, refetchAlbums }) => {
  const { refresh } = useContext(ReleasesContext);
  const [refetchReleases, setRefetchReleases] = refresh;
  const [refetch, setRefetch] = refetchAlbums;

  const [tracks, setTracks] = useState([]);
  const trackList = useRef(null);

  const windowSize = useWindowSize();
  const [cardStyle, setCardStyle] = useState(CARD_STYLE.desktop);

  const toast = useContext(ToasterContext);

  const computeTitle = (title) => {
    if (!title) {
      return '';
    }
    const firstLetter = title.split('')[0];
    const rest = title.split('');
    rest.shift();
    rest.unshift(firstLetter.toUpperCase());
    return rest.join('');
  };

  const showTrackList = async (e, album) => {
    const url = '/spotify/album/tracks/' + album.id;
    const tracksResponse = await axios.get(url);
    const tracks = tracksResponse.data.body.items;
    if (tracks) {
      setTracks(tracks);
      trackList.current.toggle(e);
    }
  };

  const addAlbum = async (id) => {
    const data = {
      id: id,
    };
    try {
      await axios.post('/spotify/saved-albums', data);
      setRefetch(!refetch);
      setRefetchReleases(!refetchReleases);
      toast.current.show({
        severity: 'success',
        summary: 'DONE',
        detail: 'Album ajouté',
      });
    } catch (err) {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Un probléme a eu lieu pendant l ajout',
      });
    }
  };

  useEffect(() => {
    if (windowSize.width > BREAKPOINT.phone) {
      setCardStyle(CARD_STYLE.desktop);
    } else {
      setCardStyle(CARD_STYLE.phone);
    }
  }, [windowSize]);

  return (
    <Card
      header={
        <div
          className="h-10rem bg-primary bg-no-repeat bg-cover bg-center"
          style={{ backgroundImage: `url(${album.images[1].url})` }}
        ></div>
      }
      style={cardStyle}
    >
      <div className="album-card-content">
        <div>
          <div>Date de sortie : {album.release_date}</div>
          <div className="font-semibold mt-1">{computeTitle(album.name)}</div>
          <div
            className="font-italic cursor-pointer mt-1"
            onClick={(e) => {
              showTrackList(e, album);
            }}
          >
            Voir la tracklist
          </div>
          <OverlayPanel ref={trackList}>
            {tracks &&
              tracks.map((track) => {
                return (
                  <div key={track.id} className="flex">
                    <div className="font-semibold mr-2">
                      {track.track_number}
                    </div>
                    <div>{track.name}</div>
                  </div>
                );
              })}
          </OverlayPanel>
        </div>
        <Button
          label="Ajouter l' album"
          style={{ marginTop: '1rem' }}
          onClick={() => {
            addAlbum(album.id);
          }}
        ></Button>
      </div>
    </Card>
  );
};

export default AlbumCard;
