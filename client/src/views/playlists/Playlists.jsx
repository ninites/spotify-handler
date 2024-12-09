import useRequest from '../../customhooks/useRequest';
import PlayListCard from './PlaylistCard';
import './Playlists.css';
import { ProgressSpinner } from 'primereact/progressspinner';

const Playlists = () => {
  const playlistsResponse = useRequest('get', '/spotify/playlists');
  const { data = [], error = '', isLoading = true } = playlistsResponse;
  const playlists = data;

  return (
    <div className="playlist-container">
      {isLoading ? (
       <ProgressSpinner/>
      ) : (
        <>
          {playlists
            .filter((playlist) => {
              return playlist?.owner?.display_name === 'ninites';
            })
            .map((playlist) => {
              return <PlayListCard key={playlist.id} playlist={playlist} />;
            })}
        </>
      )}
    </div>
  );
};

export default Playlists;
