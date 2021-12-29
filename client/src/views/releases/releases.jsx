import { useContext } from "react";
import { Card } from "primereact/card";
import ReleasesContext from "../../contexts/releases-context";

const Releases = () => {
  const { data } = useContext(ReleasesContext);
  const [releases] = data;
  
  return (
    <div className="m-2">
      {releases.map((release) => {
        return (
          <div key={release.id} className="m-2">
            <Card
              title={release.name.toUpperCase()}
              style={{ width: "60vw", height: "18rem" }}
            >
              <div
                className="h-10rem w-10rem bg-primary bg-no-repeat bg-center bg-cover"
                style={{
                  backgroundImage: `url(${release.images[0].url})`,
                }}
              ></div>
            </Card>
          </div>
        );
      })}
    </div>
  );
};

export default Releases;
