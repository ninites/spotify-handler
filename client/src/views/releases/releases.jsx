import { useContext, useState } from 'react';
import ReleasesContext from '../../contexts/releases-context';
import AlbumCard from '../artists/Album-card';

const Releases = () => {
  const { data } = useContext(ReleasesContext);
  const [releases] = data;
  const [refetch, setRefetch] = useState(false);

  return (
    <div className="w-full">
      <div className="mt-3 ml-2 mr-2 font-semibold surface-100 p-2 border-round">
        Les sorties
      </div>
      <div className="m-2 p-fluid  flex flex-wrap justify-content-center">
        {releases
          .sort((a, b) => {
            return new Date(b.release_date) - new Date(a.release_date);
          })
          .map((release) => {
            return (
              <div
                key={release.id}
                className="flex-initial flex align-items-center justify-content-center m-2"
              >
                <AlbumCard
                  album={release}
                  refetchAlbums={[refetch, setRefetch]}
                />
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Releases;
