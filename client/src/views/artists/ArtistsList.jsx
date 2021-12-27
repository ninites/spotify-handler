import { Card } from 'primereact/card';
import { useEffect, useState } from 'react';
import useRequest from '../../customhooks/useRequest';
import { Link } from "react-router-dom"
import { AutoComplete } from 'primereact/autocomplete';

const ArtistsList = () => {
  const artistsRequest = useRequest("get", 'http://localhost:3000/spotify/user/artists');
  const [artists, setArtists] = useState([])
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [searchArtist, setSearchArtist] = useState("")


  const createSuggestions = (event) => {
    let _filteredArtists;
    if (!event.query.trim().length) {
      _filteredArtists = [...artists];
    }
    else {
      _filteredArtists = artists
        .map((artist) => {
          const nameMatch = artist.name.toLowerCase().startsWith(event.query.toLowerCase());
          if (nameMatch) {
            return artist.name
          } else {
            return ''
          }
        })
        .filter((artist) => artist)
    }
    setSearchSuggestions(_filteredArtists);
  }


  useEffect(() => {
    const gotAnswer = artistsRequest.data.length !== 0
    if (gotAnswer) {
      const { artists } = artistsRequest.data.body
      setArtists(artists.items)
    }

  }, [artistsRequest])

  return (
    <div className="m-2 w-full">
      <AutoComplete value={searchArtist} suggestions={searchSuggestions} completeMethod={createSuggestions} field="Artiste" onChange={(e) => setSearchArtist(e.value)} />
      <div className="flex flex-wrap card-container justify-content-center">
        {artists
          .map((artist) => {
            return (
              <div key={artist.id} className="flex-initial flex align-items-center justify-content-center m-2">
                <Card
                  header={
                    <Link to={`/artists/${artist.id}`}>

                      <div className="h-10rem bg-primary bg-no-repeat bg-center bg-cover cursor-pointer" style={{ backgroundImage: `url(${artist.images[2].url})` }} >
                      </div>
                    </Link>
                  }
                  style={{ width: '15rem' }}
                >
                  {artist.name}
                </Card>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default ArtistsList;
