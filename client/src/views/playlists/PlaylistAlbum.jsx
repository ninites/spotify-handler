import { useState } from "react";
import { Button } from "primereact/button";
import axios from "axios";
import "./Playlists.css";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

const PlaylistAlbum = ({
  album,
  addedAt,
  playlistId,
  removeAlbumFromList,
  removeTracksFromAlbum,
}) => {
  const [buttonsLoading, setButtonLoading] = useState({
    tracks: false,
    album: false,
  });

  const selectedAlbum = album[0].track.track;
  const albumName = selectedAlbum.album.name;
  const albumCover = selectedAlbum.album.images[1].url;
  const artistName = selectedAlbum.artists[0].name;
  const releaseDate = formatDate(selectedAlbum.album.release_date);
  const gotNotLikedTracks = album.some((track) => !track.loved);
  const nothinLikedTracks = album.every((track) => !track.loved);

  function formatDate(date) {
    if (!date) {
      return "";
    }
    dayjs.extend(localizedFormat);
    const formattedDate = dayjs(date).format("LL");
    return formattedDate;
  }

  const deleteNotLikeTracks = async (tracks) => {
    try {
      setButtonLoading({ ...buttonsLoading, tracks: true });
      const tracksURI = tracks
        .filter((track) => !track.loved)
        .map((track) => {
          return { uri: track.track.track.uri };
        });
      const endpoint = "/spotify/playlists/" + playlistId + "/tracks";
      await axios.post(endpoint, { data: tracksURI });
      removeTracksFromAlbum(selectedAlbum.album.id);
      setButtonLoading({ ...buttonsLoading, tracks: false });
    } catch (error) {
      setButtonLoading({ ...buttonsLoading, tracks: false });
      console.log("====================================");
      console.log(error);
      console.log("====================================");
    }
  };

  const deleteAlbum = async (tracks) => {
    try {
      setButtonLoading({ ...buttonsLoading, album: true });
      const tracksURI = tracks.map((track) => {
        return { uri: track.track.track.uri };
      });
      const endpoint = "/spotify/playlists/" + playlistId + "/tracks";
      await axios.post(endpoint, { data: tracksURI });
      removeAlbumFromList(selectedAlbum.album.id);
      setButtonLoading({ ...buttonsLoading, album: false });
    } catch (error) {
      setButtonLoading({ ...buttonsLoading, album: false });
      console.log("====================================");
      console.log(error);
      console.log("====================================");
    }
  };

  return (
    <div className="p-card m-4 flex flex-wrap">
      <div className="album-cover-wrapper">
        <img
          src={albumCover}
          alt=""
          className="border-round-left album-cover"
        ></img>
      </div>
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
        <h3>{artistName}</h3>
        <h3>{albumName}</h3>
        <h6>{releaseDate}</h6>
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
                  style={{ color: "red" }}
                ></i>
              ) : (
                <i className="pi pi-heart" style={{ color: "red" }}></i>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlaylistAlbum;
