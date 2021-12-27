import { BrowserRouter, Routes, Route, } from "react-router-dom";
import ArtistsList from '../views/artists/ArtistsList';
import Artist from '../views/artists/Artist';
import LoginRedirect from '../views/login-redirect/LoginRedirect'

const Main = () => {
    return <BrowserRouter>
        <Routes>
            <Route path="login-redirect" element={<LoginRedirect />} />
            <Route path="artists" element={<ArtistsList />} />
            <Route path="artists/:id" element={<Artist />} />
            <Route path="login-redirect" element={<LoginRedirect />} />
        </Routes>
    </BrowserRouter>
}

export default Main