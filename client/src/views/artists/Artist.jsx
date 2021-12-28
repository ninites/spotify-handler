import { useEffect } from "react";
import { useParams } from "react-router-dom";
import useRequest from "../../customhooks/useRequest";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import axios from "axios";
import { useState, useRef, useContext } from "react";
import ArtistContext from "../../contexts/artists-context";
import { OverlayPanel } from "primereact/overlaypanel";

import "./artist.css";

const Artist = () => {
  let params = useParams();
  const [artists] = useContext(ArtistContext);
  const [artist, setArtist] = useState({
    name: "",
    images: [{ url: "" }],
  });
  const [refetch, setRefetch] = useState(false);
  const albums = useRequest(
    "get",
    "/spotify/user/missing-album?id=" + params.id,
    refetch
  );
  const [albumsToDisplay, setAlbumsToDisplay] = useState([]);
  const [tracks, setTracks] = useState([]);
  const trackList = useRef(null);

  const computeTitle = (title) => {
    if (!title) {
      return "";
    }
    const firstLetter = title.split("")[0];
    const rest = title.split("");
    rest.shift();
    rest.unshift(firstLetter.toUpperCase());
    return rest.join("");
  };

  const showTrackList = async (e, album) => {
    const url = "/spotify/user/album/tracks/" + album.id;
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
      await axios.post("/spotify/user/albums", data);
      setRefetch(!refetch);
    } catch (err) {
      console.log(err);
    }
  };

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
        <div className="font-semibold mt-2 mb-2">{artist.name.toUpperCase()}</div>
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
                <Card
                  header={
                    <div
                      className="h-10rem bg-primary bg-no-repeat bg-cover bg-center"
                      style={{ backgroundImage: `url(${album.images[1].url})` }}
                    ></div>
                  }
                  style={{ width: "15rem", height: "350px" }}
                >
                  <div className="album-card-content">
                    <div>
                      <div className="font-semibold ">
                        {computeTitle(album.name)}
                      </div>
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
                      style={{ marginTop: "1rem" }}
                      onClick={() => {
                        addAlbum(album.id);
                      }}
                    ></Button>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Artist;
