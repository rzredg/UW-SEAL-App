import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav 
      className="navbar navbar-expand-lg navbar-dark px-3"
      style={{ backgroundColor: "#4B0082" }}
    >
      <Link to="/" className="navbar-brand">
        UW SEAL
      </Link>

      {user && (
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
      )}

      <div className="collapse navbar-collapse" id="navbarNav">
        {user && (
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/projects" className="nav-link">
                Projects
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/teams" className="nav-link">
                Teams
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/clan-life" className="nav-link">
                SEAL Clan Life
              </Link>
            </li>
            {user?.role === 'Admin' && (
              <li className="nav-item">
                <Link to="/admin" className="nav-link">
                  Admin Panel
                </Link>
              </li>
            )}
          </ul>
        )}

        <div className="ms-auto d-flex align-items-center">
          {!user ? (
            <>
              <Link to="/login" className="btn btn-outline-light me-2">Login</Link>
              <Link to="/register" className="btn btn-outline-light me-2">Register</Link>
            </>
          ) : (
            <>
              <span className="text-white me-3">Hello, {user.full_name}</span>
              <button className="btn btn-danger" onClick={logout}>Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}