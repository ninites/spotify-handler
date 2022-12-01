import { useParams } from 'react-router-dom';
import useRequest from '../../customhooks/useRequest';
import { ProgressSpinner } from 'primereact/progressspinner';
import PlaylistAlbum from './PlaylistAlbum';
import { useEffect, useState } from 'react';

const PlaylistAlbums = () => {
  const [albums, setAlbums] = useState([]);
  const { id } = useParams();
  const playlistResponse = useRequest(
    'get',
    '/spotify/playlists/' + id + '/tracks'
  );
  const { data = {}, error = '', isLoading = true } = playlistResponse;

  const removeAlbumFromList = (id) => {
    const albumsToBeUpdated = JSON.parse(JSON.stringify(albums));
    delete albumsToBeUpdated[id];
    setAlbums(albumsToBeUpdated);
  };

  const removeTracksFromAlbum = (id) => {
    const albumsToBeUpdated = JSON.parse(JSON.stringify(albums));
    albumsToBeUpdated[id] = albumsToBeUpdated[id].filter(
      (track) => track.loved
    );
    setAlbums(albumsToBeUpdated);
  };

  useEffect(() => {
    setAlbums(data);
  }, [data]);

  return (
    <div className="playlist-container">
      {isLoading ? (
        <ProgressSpinner />
      ) : (
        <div>
          {Object.values(albums).map((album = [], index) => {
            return (
              <PlaylistAlbum
                album={album}
                key={index}
                playlistId={id}
                removeAlbumFromList={removeAlbumFromList}
                removeTracksFromAlbum={removeTracksFromAlbum}
              ></PlaylistAlbum>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlaylistAlbums;
