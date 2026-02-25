// frontend/src/pages/TaskDetails.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";

export default function TaskDetails() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [progressNotes, setProgressNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTask();
    loadProgressNotes();
  }, [id]);

  const loadTask = async () => {
    try {
      const res = await api.get(`/tasks/${id}`);
      setTask(res.data);
    } catch (err) {
      console.error("Failed to load task:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadProgressNotes = async () => {
    try {
      const res = await api.get(`/tasks/${id}/progress`);
      setProgressNotes(res.data || []);
    } catch (err) {
      console.error("Failed to load progress notes:", err);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.patch(`/tasks/${id}/status`, { status: newStatus });
      await loadTask();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update task status");
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSubmitting(true);
    try {
      await api.post(`/tasks/${id}/progress`, { note: newNote });
      setNewNote("");
      await loadProgressNotes();
      await loadTask(); // Reload to update last_updated
    } catch (err) {
      console.error("Failed to add note:", err);
      alert("Failed to add progress note");
    } finally {
      setSubmitting(false);
    }
  };

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

  const getStaleBadgeClass = (staleStatus) => {
    switch (staleStatus) {
      case 'IGNORE': return 'bg-warning text-dark';
      case 'STALE': return 'bg-danger';
      case 'ABANDONED': return 'bg-dark';
      default: return '';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const statuses = ['1. To Do', '2. Doing', '3. Review', '4. Done (Approved)', 'Icebox', 'Not Applicable'];

  if (loading) return <div className="container mt-4">Loading task...</div>;
  if (!task) return <div className="container mt-4">Task not found.</div>;

  return (
    <div className="container mt-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/projects">Projects</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to={`/projects/${task.project_id}`}>{task.project_name}</Link>
          </li>
          <li className="breadcrumb-item active">{task.task_name}</li>
        </ol>
      </nav>

      <div className="row">
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-body">
              <h2 className="card-title mb-3">{task.task_name}</h2>
              
              <div className="mb-3">
                <span className={`badge ${getStatusBadgeClass(task.status)} me-2`}>
                  {task.status}
                </span>
                <span className={`badge ${getPriorityBadgeClass(task.priority)} me-2`}>
                  {task.priority} Priority
                </span>
                {task.stale_status && (
                  <span className={`badge ${getStaleBadgeClass(task.stale_status)}`}>
                    {task.stale_status}
                  </span>
                )}
              </div>

              {task.description && (
                <div className="mb-3">
                  <h5>Description</h5>
                  <p className="text-muted">{task.description}</p>
                </div>
              )}

              {task.instructions && (
                <div className="mb-3">
                  <h5>Instructions</h5>
                  <p className="text-muted">{task.instructions}</p>
                </div>
              )}

              <div className="row mb-3">
                {task.estimated_hours && (
                  <div className="col-md-6">
                    <strong>Estimated Hours:</strong> {task.estimated_hours}
                  </div>
                )}
                {task.actual_hours && (
                  <div className="col-md-6">
                    <strong>Actual Hours:</strong> {task.actual_hours}
                  </div>
                )}
              </div>

              <div className="row mb-3">
                {task.start_date && (
                  <div className="col-md-6">
                    <strong>Start Date:</strong> {new Date(task.start_date).toLocaleDateString()}
                  </div>
                )}
                {task.due_date && (
                  <div className="col-md-6">
                    <strong>Due Date:</strong> {new Date(task.due_date).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <strong>Created:</strong> {formatDateTime(task.created_at)}
                </div>
                <div className="col-md-6">
                  <strong>Last Updated:</strong> {formatDateTime(task.last_updated || task.updated_at)}
                </div>
              </div>

              <hr />

              <div className="mb-3">
                <label className="form-label"><strong>Update Status</strong></label>
                <select
                  className="form-select"
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Progress Notes</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleAddNote} className="mb-4">
                <div className="mb-3">
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Add a progress note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting || !newNote.trim()}
                >
                  {submitting ? "Adding..." : "Add Note"}
                </button>
              </form>

              <div className="list-group">
                {progressNotes.length === 0 ? (
                  <div className="text-muted">No progress notes yet.</div>
                ) : (
                  progressNotes.map((note) => (
                    <div key={note.log_id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <strong>{note.full_name}</strong>
                        <small className="text-muted">
                          {new Date(note.created_at).toLocaleString()}
                        </small>
                      </div>
                      <p className="mb-0">{note.progress_note}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Assignees</h5>
            </div>
            <div className="card-body">
              {!task.assignees || task.assignees.length === 0 ? (
                <div className="text-muted">No assignees</div>
              ) : (
                <ul className="list-unstyled mb-0">
                  {task.assignees.map((assignee) => (
                    <li key={assignee.member_id} className="mb-2">
                      <strong>{assignee.full_name}</strong>
                      {assignee.is_primary && (
                        <span className="badge bg-primary ms-2">Primary</span>
                      )}
                      <div className="small text-muted">{assignee.email}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Project</h5>
            </div>
            <div className="card-body">
              <Link to={`/projects/${task.project_id}`} className="btn btn-outline-primary w-100">
                View Project: {task.project_name}
              </Link>
            </div>
          </div>

          {task.stale_status && (
            <div className="card mt-3">
              <div className="card-header bg-warning">
                <h5 className="mb-0">⚠️ Stale Task Alert</h5>
              </div>
              <div className="card-body">
                <p className="mb-2">
                  <strong>Status:</strong> <span className={`badge ${getStaleBadgeClass(task.stale_status)}`}>{task.stale_status}</span>
                </p>
                <p className="small text-muted mb-0">
                  This task hasn't been updated in a while. Please add a progress note or update the status to keep it active.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}