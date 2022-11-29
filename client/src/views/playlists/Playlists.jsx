import useRequest from '../../customhooks/useRequest';
import { Card } from 'primereact/card';
import { Image } from 'primereact/image';

const CardHeader = ({ playlist }) => {
  return <Image src={playlist.images[0].url} alt="Image Text" />;
};

const Playlists = () => {
  const playlistsResponse = useRequest('get', '/spotify/playlists');
  const { data = [], error = '', isLoading = true } = playlistsResponse;
  const playlists = data;
  console.log('====================================');
  console.log(data);
  console.log('====================================');

  return (
    <div>
      {isLoading ? (
        <div>LOADING</div>
      ) : (
        <>
          {playlists
            .filter((playlist) => {
              return playlist.owner.display_name === 'ninites';
            })
            .map((playlist) => {
              return (
                <div key={playlist.id}>
                  <Card header={<CardHeader playlist={playlist} />}>
                    Content
                  </Card>
                </div>
              );
            })}
        </>
      )}
    </div>
  );
};

export default Playlists;
