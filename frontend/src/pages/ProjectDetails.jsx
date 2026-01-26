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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case '1. To Do': return 'bg-secondary';
      case '2. Doing': return 'bg-primary';
      case '3. Review': return 'bg-warning text-dark';
      case '4. Done (Approved)': return 'bg-success';
      case 'Icebox': return 'bg-info';
      case 'Not Applicable': return 'bg-dark';
      default: return 'bg-secondary';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-danger';
      case 'High': return 'bg-warning text-dark';
      case 'Medium': return 'bg-info';
      case 'Low': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  // Group tasks by status
  const tasksByStatus = {
    '1. To Do': tasks.filter(t => t.status === '1. To Do'),
    '2. Doing': tasks.filter(t => t.status === '2. Doing'),
    '3. Review': tasks.filter(t => t.status === '3. Review'),
    '4. Done (Approved)': tasks.filter(t => t.status === '4. Done (Approved)'),
    'Other': tasks.filter(t => !['1. To Do', '2. Doing', '3. Review', '4. Done (Approved)'].includes(t.status))
  };

  if (loading) return <div className="container mt-4">Loading project...</div>;
  if (!project) return <div className="container mt-4">Project not found.</div>;

  return (
    <div className="container mt-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/projects">Projects</Link>
          </li>
          <li className="breadcrumb-item active">{project.project_name}</li>
        </ol>
      </nav>

      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h2>{project.project_name}</h2>
              <p className="text-muted">{project.description}</p>
              <div className="d-flex gap-2">
                <span className="badge bg-primary">{project.status}</span>
                <span className="badge bg-secondary">{project.priority} Priority</span>
              </div>
            </div>
            <div>
              <Link to={`/projects/${id}/edit`} className="btn btn-outline-secondary">
                Edit Project
              </Link>
            </div>
          </div>

          {(project.start_date || project.end_date) && (
            <div className="mt-3">
              {project.start_date && (
                <span className="me-3">
                  <strong>Start:</strong> {new Date(project.start_date).toLocaleDateString()}
                </span>
              )}
              {project.end_date && (
                <span>
                  <strong>End:</strong> {new Date(project.end_date).toLocaleDateString()}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Tasks <span className="badge bg-secondary">{tasks.length}</span></h4>
        <Link to={`/projects/${id}/tasks/new`} className="btn btn-primary">
          Create Task
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="alert alert-info">
          No tasks yet for this project. Create your first task to get started!
        </div>
      ) : (
        <div className="row">
          {Object.entries(tasksByStatus).map(([status, statusTasks]) => {
            if (statusTasks.length === 0) return null;
            
            return (
              <div key={status} className="col-lg-3 col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-header">
                    <strong>{status}</strong>
                    <span className="badge bg-secondary ms-2">{statusTasks.length}</span>
                  </div>
                  <div className="card-body p-2" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    <div className="d-flex flex-column gap-2">
                      {statusTasks.map((task) => (
                        <div key={task.task_id} className="card">
                          <div className="card-body p-2">
                            <Link 
                              to={`/tasks/${task.task_id}`} 
                              className="text-decoration-none fw-semibold small d-block mb-2"
                            >
                              {task.task_name}
                            </Link>
                            
                            <div className="d-flex justify-content-between align-items-center">
                              <span className={`badge ${getPriorityBadgeClass(task.priority)}`} style={{ fontSize: '0.7rem' }}>
                                {task.priority}
                              </span>
                              {task.assigned_member_name && (
                                <span className="small text-muted" style={{ fontSize: '0.7rem' }}>
                                  {task.assigned_member_name.split(' ')[0]}
                                </span>
                              )}
                            </div>

                            {task.due_date && (
                              <div className="small text-muted mt-1" style={{ fontSize: '0.7rem' }}>
                                Due: {new Date(task.due_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}