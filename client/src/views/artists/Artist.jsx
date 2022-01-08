import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useRequest from '../../customhooks/useRequest';

import { useState, useContext } from 'react';
import ArtistContext from '../../contexts/artists-context';

import './artist.css';
import AlbumCard from './Album-card';

import ProgressSpinnerW from '../../shared/progress-spinner-w';
import FullAppLoadingContext from '../../contexts/full-app-loading';

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
  const [isLoading, setisLoading] = useState(true);

  const fullAppLoading = useContext(FullAppLoadingContext);

  useEffect(() => {
    if (artists.length > 0) {
      const artist = artists.find((artist) => artist.id === params.id);
      setArtist(artist);
    }
  }, [artists, params.id]);

  useEffect(() => {
    setAlbumsToDisplay(albums.data);
  }, [albums]);

  useEffect(() => {
    const fullLoading = !albums.isLoading && !fullAppLoading;
    if (fullLoading) {
      setisLoading(false);
    } else {
      setisLoading(true);
    }
  }, [albums.isLoading, fullAppLoading]);

  return (
    <ProgressSpinnerW loading={isLoading}>
      <div className="w-full">
        <div className="mt-2 p-fluid w-full flex flex-wrap justify-content-center miss-container">
          <div className="w-2 miss-left">
            <div
              className="font-semibold mt-2 mr-2 ml-2 h-10rem bg-primary bg-no-repeat bg-center bg-cover border-round"
              style={{
                backgroundImage: `url(${artist.images[0].url})`,
              }}
            >
              <div className="p-2 surface-100 text-900">
                {artist.name.toUpperCase()}
              </div>
            </div>
          </div>
          <div className="w-10 miss-right">
            <div className="m-2 font-semibold surface-100 p-2 border-round">
              ALBUMS MANQUANTS
            </div>
            <div className="flex flex-wrap card-container">
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
      </div>
    </ProgressSpinnerW>
  );
};

export default Artist;
