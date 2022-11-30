import { useEffect } from 'react';
import { useCallback } from 'react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import useRequest from '../../customhooks/useRequest';

const PlaylistAlbums = () => {
  const [albums, setAlbums] = useState([]);
  const { id } = useParams();
  const playlistResponse = useRequest(
    'get',
    '/spotify/playlists/' + id + '/tracks'
  );
  const { data = {}, error = '', isLoading = true } = playlistResponse;
  console.log('====================================');
  console.log(data);
  console.log('====================================');
  return (
    <div className="playlist-container">
      {isLoading ? (
        <div>LOADING</div>
      ) : (
        <div>
          {Object.values(data).map((album = [], index) => {
            return (
              <div
                key={index}
                className="p-card p-p-2"
                style={{ margin: '10px' }}
              >
                <h2>{album[0].track.track.album.name}</h2>
                <div>
                  {album.map((trackObject, index) => {
                    const { track } = trackObject.track;
                    const { loved } = trackObject;

                    return (
                      <div key={index}>
                        <div>{track.name}</div>
                        {loved ? <div>J'aime</div> : <div></div>}
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
