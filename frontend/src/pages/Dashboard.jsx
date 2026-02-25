import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/api";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [memberStats, setMemberStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [sortBy, setSortBy] = useState("status"); // status, priority, due_date, stale, last_updated

  useEffect(() => {
    loadMyTasks();
    loadMemberStats();
  }, [user]);

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

  const loadMemberStats = async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/members/${user.id}`);
      setMemberStats(res.data);
    } catch (err) {
      console.error("Failed to load member stats:", err);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdating(taskId);
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
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

  const getHPBadgeClass = (hp) => {
    if (hp >= 4) return 'bg-success';
    if (hp >= 2) return 'bg-warning';
    return 'bg-danger';
  };

  const formatLastUpdated = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const statuses = ['1. To Do', '2. Doing', '3. Review', '4. Done (Approved)', 'Icebox', 'Not Applicable'];

  // Sort tasks based on selected criteria
  const getSortedTasks = (taskList) => {
    return [...taskList].sort((a, b) => {
      switch (sortBy) {
        case 'priority': {
          const priorityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
          return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
        }
        case 'due_date': {
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date) - new Date(b.due_date);
        }
        case 'stale': {
          const staleOrder = { 'ABANDONED': 0, 'STALE': 1, 'IGNORE': 2, null: 3 };
          return (staleOrder[a.stale_status] || 3) - (staleOrder[b.stale_status] || 3);
        }
        case 'last_updated': {
          return new Date(b.last_updated || b.updated_at) - new Date(a.last_updated || a.updated_at);
        }
        case 'status':
        default:
          return 0; // Keep original order for status view
      }
    });
  };

  // Group tasks by status
  const tasksByStatus = {
    '1. To Do': getSortedTasks(tasks.filter(t => t.status === '1. To Do')),
    '2. Doing': getSortedTasks(tasks.filter(t => t.status === '2. Doing')),
    '3. Review': getSortedTasks(tasks.filter(t => t.status === '3. Review')),
    '4. Done (Approved)': getSortedTasks(tasks.filter(t => t.status === '4. Done (Approved)')),
  };

  const healthPoints = memberStats?.health_points ?? user?.health_points ?? 5;
  const goldMedals = memberStats?.gold_medals ?? user?.gold_medals ?? 0;

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h1>Dashboard</h1>
          {user && (
            <div className="mb-4">
              <p>Welcome, <strong>{user.full_name}</strong></p>
              <p className="text-muted">Email: {user.email} • Role: {user.role}</p>
            </div>
          )}
        </div>

        {/* Gamification Stats Card */}
        <div className="card" style={{ minWidth: '280px' }}>
          <div className="card-header bg-dark text-white">
            <h5 className="mb-0">Your Stats</h5>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-semibold">Health Points:</span>
                <span className={`badge ${getHPBadgeClass(healthPoints)} fs-6`}>
                  {healthPoints}/5
                </span>
              </div>
              <div className="progress" style={{ height: '8px' }}>
                <div 
                  className={`progress-bar ${getHPBadgeClass(healthPoints).replace('bg-', 'bg-')}`}
                  role="progressbar" 
                  style={{ width: `${(healthPoints / 5) * 100}%` }}
                  aria-valuenow={healthPoints} 
                  aria-valuemin="0" 
                  aria-valuemax="5"
                ></div>
              </div>
              <small className="text-muted">
                {healthPoints >= 4 ? 'Good standing!' : healthPoints >= 2 ? 'Keep it up!' : 'Needs attention'}
              </small>
            </div>

            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-semibold">Gold Medals:</span>
                <span className="badge bg-warning text-dark fs-6">
                  {goldMedals}
                </span>
              </div>
              <small className="text-muted">
                {goldMedals === 0 ? 'Keep working hard to earn medals!' : 
                 goldMedals === 1 ? 'Great work!' : 
                 `Outstanding! ${goldMedals} medals earned!`}
              </small>
            </div>

            <hr className="my-3" />

            <div className="text-center">
              <small className="text-muted">
                Tasks Completed: <strong>{tasksByStatus['4. Done (Approved)'].length}</strong>
              </small>
            </div>
          </div>
        </div>
      </div>

      <hr />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>My Tasks</h3>
        <div className="d-flex gap-2 align-items-center">
          <label className="mb-0 me-2">Sort by:</label>
          <select 
            className="form-select form-select-sm" 
            style={{ width: 'auto' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="status">Default (Status)</option>
            <option value="priority">Priority</option>
            <option value="due_date">Due Date</option>
            <option value="stale">Stale Status</option>
            <option value="last_updated">Last Updated</option>
          </select>
          <span className="badge bg-primary">{tasks.length} Total</span>
        </div>
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
                              <div className="small text-muted mb-1">
                                📅 Due: {new Date(task.due_date).toLocaleDateString()}
                              </div>
                            )}

                            <div className="small text-muted mb-2" title={new Date(task.last_updated || task.updated_at).toLocaleString()}>
                              🕐 Updated: {formatLastUpdated(task.last_updated || task.updated_at)}
                            </div>

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
    </div>
  );
}