// src/pages/ProjectsList.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.get("/projects")
      .then((res) => {
        if (!mounted) return;
        setProjects(res.data || []);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  if (loading) return <div className="container mt-4">Loading projects...</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Projects</h2>
        <Link to="/projects/new" className="btn btn-primary">Create Project</Link>
      </div>

      <div className="row">
        {projects.length === 0 && <div className="col-12">No projects found.</div>}
        {projects.map((p) => (
          <div key={p.project_id} className="col-md-6 mb-3">
            <div className="card h-100">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{p.project_name}</h5>
                <p className="card-text text-truncate">{p.description || "No description"}</p>
                <div className="mt-auto d-flex justify-content-between align-items-center">
                  <Link to={`/projects/${p.project_id}`} className="btn btn-outline-primary btn-sm">Open</Link>
                  <small className="text-muted">{p.status} • {p.priority}</small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
