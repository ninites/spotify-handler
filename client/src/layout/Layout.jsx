import { Outlet } from "react-router-dom"
import { Menubar } from 'primereact/menubar';
import "./layout.css"
import { useNavigate } from "react-router-dom"

const Layout = () => {
    const navigate = useNavigate();
    const redirect = (url) => {
        navigate(url)
    }

    const items = [
        {
            label: 'Artists',
            icon: 'pi pi-fw pi-file',
            command: () => redirect("artists")
        }
    ]
    return <div>
        <Menubar model={items} className="top-bar-menu"></Menubar>
        <Outlet />
    </div>
}

export default Layout