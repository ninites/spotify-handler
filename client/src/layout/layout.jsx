import { Outlet } from "react-router-dom";
import { Menubar } from "primereact/menubar";
import "./layout.css";
import { useNavigate } from "react-router-dom";
import { AutoComplete } from "primereact/autocomplete";
import { useContext, useEffect, useState } from "react";
import ArtistContext from "../contexts/artists-context";
import LoginStatusContext from "../contexts/login-status-context";
import { useCookies } from "react-cookie";

const Layout = () => {
  const [artists] = useContext(ArtistContext);
  const [loginStatus, setLoginStatus] = useContext(LoginStatusContext);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searchArtist, setSearchArtist] = useState("");
  const [cookies, setCookie, removeCookie] = useCookies(["spotify"]);
  const navigate = useNavigate();
  const redirect = (url) => {
    navigate(url);
  };

  const findArtist = (name) => {
    return artists.find((artist) => {
      return artist.name === name;
    });
  };

  const goToSelectedArtist = (name) => {
    const artistToGo = findArtist(name);
    const url = "artists/" + artistToGo.id;
    navigate(url);
  };

  const autoCompleteItemTemplate = (item) => {
    const artist = findArtist(item);
    return (
      <div className="flex">
        <div
          className="w-2 flex-initial flex align-items-center justify-content-center mr-2 bg-no-repeat bg-cover bg-center"
          style={{
            backgroundImage: `url(${artist.images[0].url})`,
          }}
        ></div>
        <p className="flex-initial flex align-items-center justify-content-center">
          {artist.name}
        </p>
      </div>
    );
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

  const logOut = () => {
    removeCookie("spotify");
    removeCookie("app");
    setLoginStatus({ app: false, spotify: false });
    navigate("login");
  };

  const computeMenu = () => {
    const items = [
      {
        label: "Mes artistes",
        icon: "pi pi-fw pi-star",
        command: () => redirect("artists"),
        disabled: !loginStatus.app && !loginStatus.spotify,
      },
      {
        label: "Les sorties",
        icon: "pi pi-fw pi-star",
        command: () => redirect("new-releases"),
        disabled: !loginStatus.app && !loginStatus.spotify,
      },
      {
        label: "Log in",
        icon: "pi pi-fw pi-sign-in",
        items: [
          {
            label: "App",
            command: () => redirect("login"),
            disabled: loginStatus.app,
          },
          {
            label: "Spotify",
            command: () => redirect("login/spotify"),
            disabled: loginStatus.spotify,
          },
        ],
      },
      {
        label: "Log out",
        icon: "pi pi-fw pi-sign-out",
        command: () => {
          logOut();
        },
        disabled: !loginStatus.app && !loginStatus.spotify,
      },
    ];

    return items;
  };

  useEffect(() => {
    computeMenu();
  }, [loginStatus]);

  return (
    <div>
      <Menubar
        model={computeMenu()}
        className="top-bar-menu"
        end={
          loginStatus.app &&
          loginStatus.spotify && (
            <AutoComplete
              value={searchArtist}
              placeholder="Chercher un de vos artistes"
              suggestions={searchSuggestions}
              completeMethod={createSuggestions}
              field="Artiste"
              itemTemplate={autoCompleteItemTemplate}
              onChange={(e) => setSearchArtist(e.value)}
              onSelect={(e) => {
                goToSelectedArtist(e.value);
              }}
            />
          )
        }
      ></Menubar>
      <div className="layout-center">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
