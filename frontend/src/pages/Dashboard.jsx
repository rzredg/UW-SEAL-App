import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/api";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    loadMyTasks();
  }, []);

  const loadMyTasks = async () => {
    try {
      const res = await api.get("/tasks/my-tasks");
      setTasks(res.data || []);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdating(taskId);
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      // Refresh tasks
      await loadMyTasks();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update task status");
    } finally {
      setUpdating(null);
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

  const getStaleBadgeClass = (staleStatus) => {
    switch (staleStatus) {
      case 'IGNORE': return 'bg-warning text-dark';
      case 'STALE': return 'bg-danger';
      case 'ABANDONED': return 'bg-dark';
      default: return '';
    }
  };

  const getStaleIcon = (staleStatus) => {
    switch (staleStatus) {
      case 'IGNORE': return '⚠️';
      case 'STALE': return '🔴';
      case 'ABANDONED': return '💀';
      default: return '';
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

  const statuses = ['1. To Do', '2. Doing', '3. Review', '4. Done (Approved)', 'Icebox', 'Not Applicable'];

  // Group tasks by status
  const tasksByStatus = {
    '1. To Do': tasks.filter(t => t.status === '1. To Do'),
    '2. Doing': tasks.filter(t => t.status === '2. Doing'),
    '3. Review': tasks.filter(t => t.status === '3. Review'),
    '4. Done (Approved)': tasks.filter(t => t.status === '4. Done (Approved)'),
  };

  return (
    <div className="container mt-5">
      <h1>Dashboard</h1>

      {user && (
        <>
          <div className="mb-4">
            <p>Welcome, <strong>{user.full_name}</strong></p>
            <p className="text-muted">Email: {user.email} • Role: {user.role}</p>
          </div>

          <hr />

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>My Tasks</h3>
            <span className="badge bg-primary">{tasks.length} Total</span>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="alert alert-info">
              You don't have any assigned tasks yet.
            </div>
          ) : (
            <div className="row">
              {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
                <div key={status} className="col-md-6 col-lg-3 mb-4">
                  <div className="card h-100">
                    <div className="card-header">
                      <strong>{status}</strong>
                      <span className="badge bg-secondary ms-2">{statusTasks.length}</span>
                    </div>
                    <div className="card-body p-2" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                      {statusTasks.length === 0 ? (
                        <div className="text-center text-muted small py-3">No tasks</div>
                      ) : (
                        <div className="d-flex flex-column gap-2">
                          {statusTasks.map((task) => (
                            <div key={task.task_id} className="card">
                              <div className="card-body p-2">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <Link 
                                    to={`/tasks/${task.task_id}`} 
                                    className="text-decoration-none fw-semibold small"
                                    style={{ flex: 1 }}
                                  >
                                    {task.task_name}
                                  </Link>
                                  <div className="d-flex gap-1">
                                    {task.stale_status && (
                                      <span 
                                        className={`badge ${getStaleBadgeClass(task.stale_status)}`} 
                                        style={{ fontSize: '0.7rem' }}
                                        title={`Task is ${task.stale_status.toLowerCase()}`}
                                      >
                                        {getStaleIcon(task.stale_status)} {task.stale_status}
                                      </span>
                                    )}
                                    <span className={`badge ${getPriorityBadgeClass(task.priority)}`} style={{ fontSize: '0.7rem' }}>
                                      {task.priority}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="small text-muted mb-2">
                                  {task.project_name}
                                </div>

                                {task.due_date && (
                                  <div className="small text-muted mb-2">
                                    Due: {new Date(task.due_date).toLocaleDateString()}
                                  </div>
                                )}

                                <select
                                  className="form-select form-select-sm"
                                  value={task.status}
                                  onChange={(e) => handleStatusChange(task.task_id, e.target.value)}
                                  disabled={updating === task.task_id}
                                >
                                  {statuses.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}