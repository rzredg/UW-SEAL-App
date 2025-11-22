// src/pages/TeamsList.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

export default function TeamsList() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.get("/teams")
      .then((res) => {
        if (!mounted) return;
        // assume backend returns array at res.data (adjust as needed)
        setTeams(res.data || []);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load teams");
      })
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  if (loading) return <div className="container mt-4">Loading teams...</div>;
  if (error) return <div className="container mt-4 alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Teams</h2>
        <Link to="/teams/new" className="btn btn-primary">Create Team</Link>
      </div>

      <div className="row">
        {teams.length === 0 && <div className="col-12">No teams found.</div>}
        {teams.map((t) => (
          <div key={t.team_id} className="col-md-6 col-lg-4 mb-3">
            <div className="card h-100">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{t.team_name}</h5>
                <p className="card-text text-truncate" style={{ flex: "1 1 auto" }}>{t.description || "No description"}</p>
                <div className="mt-3 d-flex justify-content-between align-items-center">
                  <Link to={`/teams/${t.team_id}`} className="btn btn-outline-primary btn-sm">View</Link>
                  <small className="text-muted">Members: {t.member_count ?? "—"}</small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
