import { useContext, useState } from 'react';
import ReleasesContext from '../../contexts/releases-context';
import AlbumCard from '../artists/Album-card';

const Releases = () => {
  const { data } = useContext(ReleasesContext);
  const [releases] = data;
  const [refetch, setRefetch] = useState(false);

  return (
    <div className="m-2 p-fluid w-full flex flex-wrap justify-content-center">
      {releases.map((release) => {
        return (
          <AlbumCard
            album={release}
            refetchAlbums={[refetch, setRefetch]}
            key={release.id}
          />
        );
      })}
    </div>
  );
};

export default Releases;
