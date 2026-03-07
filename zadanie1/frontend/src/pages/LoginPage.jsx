import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "./Navbar.css"

export default function Navbar() {
    const {user, logout} = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate("/")
    }

    return (
        <nav className="navbar">
            <div>
                <Link to="/"> Slovenskí olympionici</Link>
            </div>

            <div className="navbar-menu">
                <Link to="/" className="navbar-link">Olympionici</Link>

                {user ? (
                    <>
                        <Link to="/dashboard" className="navbar-link">Import dát</Link>
                        <Link to="/profile" className="navbar-link">{user.first_name} {user.last_name}</Link>
                        <button onClick={handleLogout} className="navbar-btn navbar-btn--logout">
                            Odhlásiť sa
                        </button>
                    </>
                ) : (
                    <>
                    <Link to="/login" className="navbar-btn navbar-btn--login">Prihlásiť sa</Link>
                    <Link to="/register" className="navbar-btn navbar-btn--register">Registrácia</Link>
                    </>
                )}
            </div>
        </nav>
    )
}