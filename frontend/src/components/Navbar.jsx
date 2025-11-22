import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar navbar-dark bg-dark px-3">
      <Link to="/" className="navbar-brand">
        UW SEAL
      </Link>

      <div>
        {!user ? (
          <>
            <Link to="/login" className="btn btn-outline-light me-2">Login</Link>
            <Link to="/register" className="btn btn-primary">Register</Link>
          </>
        ) : (
          <>
            <span className="text-white me-3">Hello, {user.full_name}</span>
            <button className="btn btn-danger" onClick={logout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
