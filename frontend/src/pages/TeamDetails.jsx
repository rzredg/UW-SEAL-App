// src/pages/TeamDetails.jsx
import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";

export default function TeamDetails() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    // fetch team, team members and assigned projects
    Promise.all([
      api.get(`/teams/${id}`),
      api.get(`/teams/${id}/members`),
      api.get(`/teams/${id}/projects`)
    ])
      .then(([teamRes, membersRes, projectsRes]) => {
        if (!mounted) return;
        setTeam(teamRes.data || null);
        setMembers(membersRes.data || []);
        setProjects(projectsRes.data || []);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => mounted && setLoading(false));

    return () => (mounted = false);
  }, [id]);

  const handleJoin = async () => {
    if (!user) return window.location.href = "/login";
    setJoining(true);
    try {
      await api.post(`/teams/${id}/join`);
      // refresh members
      const membersRes = await api.get(`/teams/${id}/members`);
      setMembers(membersRes.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to join team");
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <div className="container mt-4">Loading team...</div>;
  if (!team) return <div className="container mt-4">Team not found.</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h2>{team.team_name}</h2>
          <p>{team.description}</p>
        </div>
        <div>
          <button className="btn btn-outline-success" onClick={handleJoin} disabled={joining}>
            {joining ? "Joining..." : "Join Team"}
          </button>
        </div>
      </div>

      <hr />

      <h5>Members</h5>
      <div className="list-group mb-4">
        {members.length === 0 && <div className="list-group-item">No members yet</div>}
        {members.map((m) => (
          <div key={m.member_id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{m.full_name}</strong>
              <div className="small text-muted">{m.role}</div>
            </div>
            <div>{m.email}</div>
          </div>
        ))}
      </div>

      <h5>Assigned Projects</h5>
      <div className="row">
        {projects.length === 0 && <div className="col-12">No projects assigned to this team.</div>}
        {projects.map((p) => (
          <div key={p.project_id} className="col-md-6 mb-3">
            <div className="card">
              <div className="card-body d-flex justify-content-between">
                <div>
                  <h6 className="card-title">{p.project_name}</h6>
                  <div className="small text-muted">{p.status} • Priority: {p.priority}</div>
                </div>
                <Link to={`/projects/${p.project_id}`} className="btn btn-sm btn-outline-primary align-self-center">Open</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
