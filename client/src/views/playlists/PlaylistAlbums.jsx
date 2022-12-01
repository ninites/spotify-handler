import { useParams } from 'react-router-dom';
import useRequest from '../../customhooks/useRequest';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Button } from 'primereact/button';
import axios from 'axios';

const PlaylistAlbums = () => {
  const { id } = useParams();
  const playlistResponse = useRequest(
    'get',
    '/spotify/playlists/' + id + '/tracks'
  );
  const { data = {}, error = '', isLoading = true } = playlistResponse;

  const deleteNotLikeTracks = async (tracks) => {
    try {
      const tracksURI = tracks
        .filter((track) => !track.loved)
        .map((track) => {
          return { uri: track.track.track.uri };
        });
      const endpoint = '/spotify/playlists/' + id + '/tracks';
      await axios.post(endpoint, { data: tracksURI });
    } catch (error) {
      console.log('====================================');
      console.log(error);
      console.log('====================================');
    }
  };

  const deleteAlbum = async (tracks) => {};

  return (
    <div className="playlist-container">
      {isLoading ? (
        <ProgressSpinner />
      ) : (
        <div>
          {Object.values(data).map((album = [], index) => {
            const albumName = album[0].track.track.album.name;
            const albumCover = album[0].track.track.album.images[1].url;
            const gotNotLikedTracks = album.some((track) => !track.loved);
            return (
              <div className="p-card m-4 flex flex-wrap" key={index}>
                <img
                  src={albumCover}
                  alt=""
                  style={{ height: 'fit-content', position: 'relative' }}
                  className="border-round-left"
                ></img>
                <div className="p-4 flex-1">
                  <div className="flex justify-content-end">
                    {gotNotLikedTracks ? (
                      <Button
                        icon="pi pi-check"
                        onClick={() => deleteNotLikeTracks(album)}
                        className="p-button-rounded p-button-outlined p-button-success"
                      />
                    ) : (
                      <></>
                    )}

                    <Button
                      icon="pi pi-times"
                      onClick={() => deleteAlbum(album)}
                      className="p-button-rounded p-button-danger ml-2"
                    />
                  </div>
                  <h2>{albumName}</h2>
                  {album.map((trackObject, index) => {
                    const { track } = trackObject.track;
                    const { loved } = trackObject;

                    return (
                      <div
                        key={index}
                        className="flex column-gap-4 row-gap-6 justify-content-between m-2"
                      >
                        <div className="text-xs">{track.name}</div>
                        {loved ? (
                          <i
                            className="pi pi-heart-fill ml-2"
                            style={{ color: 'red' }}
                          ></i>
                        ) : (
                          <i
                            className="pi pi-heart"
                            style={{ color: 'red' }}
                          ></i>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlaylistAlbums;
