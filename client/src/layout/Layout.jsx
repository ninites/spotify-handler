import { Outlet } from "react-router-dom";
import { Menubar } from "primereact/menubar";
import "./layout.css";
import { useNavigate } from "react-router-dom";
import { AutoComplete } from "primereact/autocomplete";
import { useContext, useState } from "react";
import ArtistContext from "../contexts/artists-context";

const Layout = () => {
  const [artists, setArtists] = useContext(ArtistContext);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searchArtist, setSearchArtist] = useState("");
  const navigate = useNavigate();
  const redirect = (url) => {
    navigate(url);
  };

  const goToSelected = (name) => {
    const artistToGo = artists.find((artist) => {
        return artist.name === name
    });
    const url = "artists/" + artistToGo.id;
    navigate(url);
  };

  const createSuggestions = (event) => {
    let _filteredArtists;
    if (!event.query.trim().length) {
      _filteredArtists = [...artists];
    } else {
      _filteredArtists = artists
        .map((artist) => {
          const nameMatch = artist.name
            .toLowerCase()
            .startsWith(event.query.toLowerCase());
          if (nameMatch) {
            return artist.name;
          } else {
            return "";
          }
        })
        .filter((artist) => artist);
    }
    setSearchSuggestions(_filteredArtists);
  };

  const items = [
    {
      label: "Artists",
      icon: "pi pi-fw pi-star",
      command: () => redirect("artists"),
    },
  ];
  return (
    <div>
      <Menubar
        model={items}
        className="top-bar-menu"
        end={
          <AutoComplete
            value={searchArtist}
            placeholder="Chercher un de vos artistes"
            suggestions={searchSuggestions}
            completeMethod={createSuggestions}
            field="Artiste"
            onChange={(e) => setSearchArtist(e.value)}
            onSelect={(e) => {
              goToSelected(e.value);
            }}
          />
        }
      ></Menubar>
      <div className="layout-center">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
