import { useParams } from "react-router-dom";
import useRequest from "../../customhooks/useRequest";
import { ProgressSpinner } from "primereact/progressspinner";
import PlaylistAlbum from "./PlaylistAlbum";
import { useEffect, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

const PlaylistAlbums = () => {
  const [albums, setAlbums] = useState([]);
  const [selectedFilteredDate, setSelectedFilteredDate] = useState(0);
  const { id } = useParams();
  const playlistResponse = useRequest(
    "get",
    "/spotify/playlists/" + id + "/tracks"
  );
  const { data = {}, error = "", isLoading = true } = playlistResponse;

  const dateFilterOptions = [
    { label: "Pas de filtre", value: 0 },
    { label: "6 mois", value: 6 },
    { label: "1 an", value: 12 },
  ];

  const removeAlbumFromList = (id) => {
    const albumsToBeUpdated = JSON.parse(JSON.stringify(albums));
    delete albumsToBeUpdated[id];
    setAlbums(albumsToBeUpdated);
  };

  const removeTracksFromAlbum = (id) => {
    const albumsToBeUpdated = JSON.parse(JSON.stringify(albums));
    albumsToBeUpdated[id].tracks = albumsToBeUpdated[id].tracks.filter(
      (track) => track.loved
    );
    setAlbums(albumsToBeUpdated);
  };

  const handleFilter = (e) => {
    setSelectedFilteredDate(e.value);
  };

  const filterByAddedDate = (album) => {
    const filteredDate = dayjs().subtract(selectedFilteredDate, "month");
    const releaseDate = dayjs(album.tracks[0].track.added_at);
    dayjs.extend(isSameOrBefore);
    const releasedBeforeFilterDate = releaseDate.isSameOrBefore(filteredDate);
    return releasedBeforeFilterDate;
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
          <div className="m-4">
            <div className="mb-2">
              <small>Albums ajoutés depuis plus de : </small>
            </div>
            <Dropdown
              value={selectedFilteredDate}
              options={dateFilterOptions}
              onChange={handleFilter}
            />
          </div>
          {Object.values(albums)
            .filter(filterByAddedDate)
            .map((album = [], index) => {
              return (
                <PlaylistAlbum
                  album={album.tracks}
                  addedAt={album.added_at}
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
