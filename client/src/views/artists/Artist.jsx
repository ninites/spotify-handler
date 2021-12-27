import { useEffect } from "react"
import { useParams } from "react-router-dom";
import useRequest from "../../customhooks/useRequest";
import { Card } from 'primereact/card';
import { Button } from 'primereact/button'
import axios from "axios";
import { useState } from "react";


const Artist = () => {
    let params = useParams()
    const [refetch, setRefetch] = useState(false)
    const albums = useRequest('get', "http://localhost:3000/spotify/user/missing-album?id=" + params.id, refetch)
    const [albumsToDisplay, setAlbumsToDisplay] = useState([])


    const addAlbum = async (id) => {
        const data = {
            id: id
        }
        try {
            await axios.post('http://localhost:3000/spotify/user/albums', data)
            setRefetch(!refetch)

        } catch (err) {
            console.log(err);
        }

    }

    useEffect(() => {
        setAlbumsToDisplay(albums.data)
    }, [albums])


    return (<div className="flex flex-wrap card-container">
        {albumsToDisplay.map((album) => {
            return <div key={album.id} className="flex-initial flex align-items-center justify-content-center m-2">
                <Card
                    header={
                        <div className="h-10rem bg-primary bg-no-repeat bg-cover bg-center cursor-pointer" style={{ backgroundImage: `url(${album.images[1].url})` }} >
                        </div>
                    }
                    style={{ width: '15rem' }}
                >
                    {album.name}
                    <Button label="Ajouter l' album" onClick={() => {
                        addAlbum(album.id)
                    }}></Button>
                </Card>
            </div>
        })}
    </div>)
}

export default Artist