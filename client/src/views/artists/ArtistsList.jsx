import { Card } from 'primereact/card';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import ArtistContext from '../../contexts/artists-context';
import useWindowSize from '../../customhooks/useWindowSize';
import { useState, useEffect } from 'react';
import { BREAKPOINT } from '../../global/variables';
import ProgressSpinnerW from '../../shared/progress-spinner-w';
import FullAppLoadingContext from '../../contexts/full-app-loading';

const CARD_STYLE = {
  desktop: { width: '15rem' },
  phone: { width: '94vw' },
};

const ArtistsList = () => {
  const [artists] = useContext(ArtistContext);
  const windowSize = useWindowSize();
  const [cardStyle, setCardStyle] = useState(CARD_STYLE.desktop);
  const fullAppLoading = useContext(FullAppLoadingContext);

  useEffect(() => {
    if (windowSize.width > BREAKPOINT.phone) {
      setCardStyle(CARD_STYLE.desktop);
    } else {
      setCardStyle(CARD_STYLE.phone);
    }
  }, [windowSize]);

  return (
    <ProgressSpinnerW loading={fullAppLoading}>
      <div className="w-full p-fluid mt-3">
        <div className="m-2 font-semibold surface-100 p-2 border-round ">
          Mes artistes
        </div>
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
                  style={cardStyle}
                >
                  <div className="font-semibold">{artist.name}</div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </ProgressSpinnerW>
  );
};

export default ArtistsList;
