import { useEffect, useState } from "react";
import useRequest from "../../customhooks/useRequest";
import { Card } from "primereact/card";
import { ProgressSpinner } from "primereact/progressspinner";

const Releases = () => {
  const newReleasesResponse = useRequest("get", "/spotify/user/new-releases");
  const [releases, setReleases] = useState([]);
  const [isLoading, setisLoading] = useState(false);

  useEffect(() => {
    setReleases(newReleasesResponse.data);
  }, [newReleasesResponse]);

  useEffect(() => {
    setisLoading(newReleasesResponse.isLoading);
  }, [newReleasesResponse.isLoading]);

  return (
    <div className="m-2">
      {isLoading && <ProgressSpinner />}
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
