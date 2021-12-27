import { Card } from 'primereact/card';
import { useEffect, useState } from 'react';
import useRequest from '../../customhooks/useRequest';
import { Link } from "react-router-dom"
const ArtistsList = () => {
  const artistsRequest = useRequest("get", 'http://localhost:3000/spotify/user/artists');
  const [artists, setArtists] = useState([])

  useEffect(() => {
    const gotAnswer = artistsRequest.data.length !== 0
    if (gotAnswer) {
      const { artists } = artistsRequest.data.body
      setArtists(artists.items)
    }

  }, [artistsRequest])

  return (
    <div className="flex flex-wrap card-container">
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
  );
};

export default ArtistsList;
