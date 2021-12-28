import { Card } from "primereact/card";
import { useContext } from "react";
import { Link } from "react-router-dom";
import ArtistContext from "../../contexts/artists-context";

const ArtistsList = () => {
  const [artists] = useContext(ArtistContext);

  return (
    <div className="m-2 w-full p-fluid ">
      <div className="flex flex-wrap card-container justify-content-center">
        {artists.map((artist) => {
          return (
            <div
              key={artist.id}
              className="flex-initial flex align-items-center justify-content-center m-2"
            >
              <Card
                header={
                  <Link to={`/artists/${artist.id}`}>
                    <div
                      className="h-10rem bg-primary bg-no-repeat bg-center bg-cover cursor-pointer"
                      style={{
                        backgroundImage: `url(${artist.images[2].url})`,
                      }}
                    ></div>
                  </Link>
                }
                style={{ width: "15rem" }}
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
