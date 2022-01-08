import { useContext, useState } from 'react';
import FullAppLoadingContext from '../../contexts/full-app-loading';
import ReleasesContext from '../../contexts/releases-context';
import ProgressSpinnerW from '../../shared/progress-spinner-w';
import AlbumCard from '../artists/Album-card';

const Releases = () => {
  const { data } = useContext(ReleasesContext);
  const [releases] = data;
  const [refetch, setRefetch] = useState(false);
  const fullAppLoading = useContext(FullAppLoadingContext);

  return (
    <ProgressSpinnerW loading={fullAppLoading}>
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
    </ProgressSpinnerW>
  );
};

export default Releases;
