import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useRequest from '../../customhooks/useRequest';

import { useState, useRef, useContext } from 'react';
import ArtistContext from '../../contexts/artists-context';

import './artist.css';
import AlbumCard from './Album-card';

const Artist = () => {
  let params = useParams();

  const [artists] = useContext(ArtistContext);
  const [artist, setArtist] = useState({
    name: '',
    images: [{ url: '' }],
  });

  const [refetch, setRefetch] = useState(false);
  const albums = useRequest(
    'get',
    '/spotify/missing-albums?id=' + params.id,
    refetch
  );
  const [albumsToDisplay, setAlbumsToDisplay] = useState([]);

  useEffect(() => {
    if (artists.length > 0) {
      const artist = artists.find((artist) => artist.id === params.id);
      setArtist(artist);
    }
  }, [artists, params.id]);

  useEffect(() => {
    setAlbumsToDisplay(albums.data);
  }, [albums]);

  return (
    <div className="m-2 p-fluid w-full flex flex-wrap justify-content-center">
      <div className="">
        <div className="font-semibold mt-2 mb-2">
          {artist.name.toUpperCase()}
        </div>
        <div
          className="h-10rem bg-primary bg-no-repeat bg-center bg-cover"
          style={{
            backgroundImage: `url(${artist.images[0].url})`,
          }}
        ></div>
      </div>
      <div className="missing-albums">
        <div className="ml-2 mt-2 font-semibold">ALBUMS MANQUANTS</div>
        <div className="flex flex-wrap card-container  displayed-albums">
          {albumsToDisplay.length === 0 && (
            <p>Vous avez tous les albums de cet artiste</p>
          )}
          {albumsToDisplay.map((album) => {
            return (
              <div
                key={album.id}
                className="flex-initial flex align-items-center justify-content-center m-2"
              >
                <AlbumCard
                  album={album}
                  refetchAlbums={[refetch, setRefetch]}
                  key={album.id}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Artist;
