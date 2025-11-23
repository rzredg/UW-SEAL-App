import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  return (
    <div className="container mt-5">
      <h1>Dashboard</h1>

      {user && (
        <>
          <p>Welcome, <strong>{user.full_name}</strong></p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
          
          <div className="mt-4">
            <h3>Quick Links</h3>
            <div className="row mt-3">
              <div className="col-md-6 mb-3">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Teams</h5>
                    <p className="card-text">View and manage teams</p>
                    <Link to="/teams" className="btn btn-primary">Go to Teams</Link>
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Projects</h5>
                    <p className="card-text">View and manage projects</p>
                    <Link to="/projects" className="btn btn-primary">Go to Projects</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}