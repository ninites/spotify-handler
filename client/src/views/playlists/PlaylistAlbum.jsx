import { useState } from 'react';
import { Button } from 'primereact/button';
import axios from 'axios';

const PlaylistAlbum = ({
  album,
  playlistId,
  removeAlbumFromList,
  removeTracksFromAlbum,
}) => {
  const [buttonsLoading, setButtonLoading] = useState({
    tracks: false,
    album: false,
  });
  const albumName = album[0].track.track.album.name;
  const albumCover = album[0].track.track.album.images[1].url;
  const gotNotLikedTracks = album.some((track) => !track.loved);
  const nothinLikedTracks = album.every((track) => !track.loved);

  const deleteNotLikeTracks = async (tracks) => {
    try {
      setButtonLoading({ ...buttonsLoading, tracks: true });
      const tracksURI = tracks
        .filter((track) => !track.loved)
        .map((track) => {
          return { uri: track.track.track.uri };
        });
      const endpoint = '/spotify/playlists/' + playlistId + '/tracks';
      await axios.post(endpoint, { data: tracksURI });
      removeTracksFromAlbum(album[0].track.track.album.id);
      setButtonLoading({ ...buttonsLoading, tracks: false });
    } catch (error) {
      setButtonLoading({ ...buttonsLoading, tracks: false });
      console.log('====================================');
      console.log(error);
      console.log('====================================');
    }
  };

  const deleteAlbum = async (tracks) => {
    try {
      setButtonLoading({ ...buttonsLoading, tracks: true });
      const tracksURI = tracks.map((track) => {
        return { uri: track.track.track.uri };
      });
      const endpoint = '/spotify/playlists/' + playlistId + '/tracks';
      await axios.post(endpoint, { data: tracksURI });
      removeAlbumFromList(album[0].track.track.album.id)
      setButtonLoading({ ...buttonsLoading, tracks: false });
    } catch (error) {
      setButtonLoading({ ...buttonsLoading, tracks: false });
      console.log('====================================');
      console.log(error);
      console.log('====================================');
    }
  };

  return (
    <div className="p-card m-4 flex flex-wrap">
      <img
        src={albumCover}
        alt=""
        style={{ height: 'fit-content', position: 'relative' }}
        className="border-round-left"
      ></img>
      <div className="p-4 flex-1">
        <div className="flex justify-content-end">
          {gotNotLikedTracks && !nothinLikedTracks ? (
            <Button
              loading={buttonsLoading.tracks}
              icon="pi pi-check"
              onClick={() => deleteNotLikeTracks(album)}
              className="p-button-rounded p-button-outlined p-button-success"
            />
          ) : (
            <></>
          )}
          <Button
            loading={buttonsLoading.album}
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
                <i className="pi pi-heart" style={{ color: 'red' }}></i>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlaylistAlbum;
