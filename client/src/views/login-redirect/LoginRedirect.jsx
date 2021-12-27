import { Button } from 'primereact/button'
import { useContext } from 'react'
import JustLogggedContext from '../../contexts/just-logged'
const LoginRedirect = () => {
    const [justLogged, setJustLogged] = useContext(JustLogggedContext)

    const closeWindow = () => {
        setJustLogged(true)
        window.close()
    }


    return (<div>
        Vous etes connectés à Spotify !
        <Button label="Fermer" onClick={closeWindow} ></Button>
    </div>)
}

export default LoginRedirect