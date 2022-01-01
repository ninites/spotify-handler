import { Card } from 'primereact/card';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { useState, useRef, useContext } from 'react';
import axios from 'axios';
import ReleasesContext from '../../contexts/releases-context';

const AlbumCard = ({ album, refetchAlbums }) => {
  const { refresh } = useContext(ReleasesContext);
  const [refetchReleases, setRefetchReleases] = refresh;
  const [refetch, setRefetch] = refetchAlbums;

  const [tracks, setTracks] = useState([]);
  const trackList = useRef(null);

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
    const url = '/spotify/album/tracks/' + album.album_id;
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
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <Card
      header={
        <div
          className="h-10rem bg-primary bg-no-repeat bg-cover bg-center"
          style={{ backgroundImage: `url(${album.images[1].url})` }}
        ></div>
      }
      style={{ width: '15rem', height: '350px' }}
    >
      <div className="album-card-content">
        <div>
          <div className="font-semibold ">{computeTitle(album.name)}</div>
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
            addAlbum(album.album_id);
          }}
        ></Button>
      </div>
    </Card>
  );
};

export default AlbumCard;
