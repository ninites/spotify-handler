import { useNavigate } from 'react-router-dom';

const PlayListCard = ({ playlist }) => {
  console.log('====================================');
  console.log(playlist);
  console.log('====================================');
  const navigate = useNavigate();

  const goToPlaylist = () => {
    navigate('/playlists/' + playlist.id);
  };

  return (
    <div
      key={playlist.id}
      className="p-card playlist-card-wrapper"
      onClick={goToPlaylist}
    >
      <div className="playlist-card-image">
        <img src={playlist.images[0].url} alt="" />
        <div className="shadow"></div>
      </div>
      <p>{playlist.name}</p>
    </div>
  );
};

export default PlayListCard;
