import { useEffect } from "react"
import { useParams } from "react-router-dom";
import useRequest from "../customhooks/useRequest";

const Artist = () => {
    let params = useParams()
    const artist = useRequest('get',"")

    useEffect(() => {
        
    }, [])
    return (<div></div>)
}

export default Artist