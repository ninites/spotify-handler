import { useEffect } from "react"
import { useParams } from "react-router-dom";
import useRequest from "../customhooks/useRequest";
import { Card } from 'primereact/card';


const Artist = () => {
    let params = useParams()
    const albums = useRequest('get', "http://localhost:3000/spotify/user/missing-album?id=" + params.id)

    useEffect(() => {
    }, [albums])
    return (<div className="grid">
        {albums.data.map((album) => {
            return <div key={album.id} className="col-2">
                <Card
                    header={
                        <div className="h-10rem bg-primary bg-no-repeat bg-cover bg-center cursor-pointer" style={{ backgroundImage: `url(${album.images[1].url})` }} >
                        </div>
                    }
                >
                    {album.name}
                </Card>
            </div>
        })}
    </div>)
}

export default Artist