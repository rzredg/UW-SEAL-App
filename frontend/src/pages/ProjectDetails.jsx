// src/pages/ProjectDetails.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/projects/${id}/tasks`)
    ])
      .then(([projRes, tasksRes]) => {
        if (!mounted) return;
        setProject(projRes.data || null);
        setTasks(tasksRes.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => mounted && setLoading(false));

    return () => (mounted = false);
  }, [id]);

  if (loading) return <div className="container mt-4">Loading project...</div>;
  if (!project) return <div className="container mt-4">Project not found.</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h2>{project.project_name}</h2>
          <p>{project.description}</p>
          <div className="small text-muted">Status: {project.status} • Priority: {project.priority}</div>
        </div>
        <div>
          <Link to={`/projects/${id}/edit`} className="btn btn-outline-secondary">Edit</Link>
        </div>
      </div>

      <hr />

      <h5>Tasks</h5>
      {tasks.length === 0 ? (
        <div>No tasks yet for this project.</div>
      ) : (
        <div className="list-group">
          {tasks.map((t) => (
            <div key={t.task_id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>{t.task_name}</strong>
                <div className="small text-muted">{t.status} • {t.priority}</div>
              </div>
              <Link to={`/tasks/${t.task_id}`} className="btn btn-sm btn-outline-primary">Open</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
