// frontend/src/pages/CreateTask.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/api";

export default function CreateTask() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    task_name: "",
    description: "",
    instructions: "",
    priority: "Medium",
    estimated_hours: "",
    due_date: "",
    selectedAssignees: [] // Array of member_ids
  });

  useEffect(() => {
    loadProjectAndMembers();
  }, [projectId]);

  const loadProjectAndMembers = async () => {
    try {
      const [projectRes, membersRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/members`)
      ]);
      
      setProject(projectRes.data);
      setAvailableMembers(membersRes.data || []);
    } catch (err) {
      console.error("Failed to load project:", err);
      setError("Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAssigneeToggle = (memberId) => {
    setFormData(prev => {
      const isSelected = prev.selectedAssignees.includes(memberId);
      return {
        ...prev,
        selectedAssignees: isSelected
          ? prev.selectedAssignees.filter(id => id !== memberId)
          : [...prev.selectedAssignees, memberId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!formData.task_name.trim()) {
      setError("Task name is required");
      return;
    }

    setSubmitting(true);
    try {
      // Build assignees array with proper structure
      const assignees = formData.selectedAssignees.map((memberId, index) => ({
        member_id: memberId,
        assignment_type: 'assignee',
        is_primary: index === 0 // First assignee is primary
      }));

      const payload = {
        task_name: formData.task_name.trim(),
        description: formData.description.trim(),
        instructions: formData.instructions.trim(),
        priority: formData.priority,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        due_date: formData.due_date || null,
        assignees: assignees
      };

      await api.post(`/projects/${projectId}/tasks`, payload);
      
      // Redirect back to project details
      navigate(`/projects/${projectId}`);
    } catch (err) {
      console.error("Failed to create task:", err);
      setError(err.response?.data?.error || "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container mt-4">Loading...</div>;
  }

  if (!project) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">Project not found</div>
        <Link to="/projects" className="btn btn-primary">Back to Projects</Link>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/projects">Projects</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to={`/projects/${projectId}`}>{project.project_name}</Link>
          </li>
          <li className="breadcrumb-item active">Create Task</li>
        </ol>
      </nav>

      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h4 className="mb-0">Create New Task</h4>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger">{error}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Task Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    name="task_name"
                    value={formData.task_name}
                    onChange={handleChange}
                    required
                    placeholder="Enter task name"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Describe what needs to be done"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Instructions</label>
                  <textarea
                    className="form-control"
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Detailed instructions for completing this task"
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-select"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Estimated Hours</label>
                    <input
                      type="number"
                      className="form-control"
                      name="estimated_hours"
                      value={formData.estimated_hours}
                      onChange={handleChange}
                      min="0"
                      step="0.5"
                      placeholder="e.g., 8.5"
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Due Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="due_date"
                      value={formData.due_date}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label">Assign To</label>
                  {availableMembers.length === 0 ? (
                    <div className="alert alert-info">
                      No team members available for this project. Make sure teams are assigned to this project first.
                    </div>
                  ) : (
                    <div className="card">
                      <div className="card-body">
                        <div className="small text-muted mb-2">
                          Select one or more members to assign this task. The first selected member will be the primary assignee.
                        </div>
                        <div className="list-group">
                          {availableMembers.map((member) => (
                            <label
                              key={member.member_id}
                              className="list-group-item list-group-item-action d-flex align-items-center"
                              style={{ cursor: 'pointer' }}
                            >
                              <input
                                type="checkbox"
                                className="form-check-input me-3"
                                checked={formData.selectedAssignees.includes(member.member_id)}
                                onChange={() => handleAssigneeToggle(member.member_id)}
                              />
                              <div className="flex-grow-1">
                                <div className="fw-semibold">{member.full_name}</div>
                                <div className="small text-muted">{member.email}</div>
                              </div>
                              {formData.selectedAssignees[0] === member.member_id && (
                                <span className="badge bg-primary">Primary</span>
                              )}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? "Creating..." : "Create Task"}
                  </button>
                  <Link
                    to={`/projects/${projectId}`}
                    className="btn btn-outline-secondary"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Project Info</h5>
            </div>
            <div className="card-body">
              <h6>{project.project_name}</h6>
              <p className="text-muted small mb-2">{project.description}</p>
              <div className="d-flex gap-2">
                <span className="badge bg-primary">{project.status}</span>
                <span className="badge bg-secondary">{project.priority}</span>
              </div>
            </div>
          </div>

          {formData.selectedAssignees.length > 0 && (
            <div className="card mt-3">
              <div className="card-header">
                <h5 className="mb-0">Selected Assignees</h5>
              </div>
              <div className="card-body">
                <ul className="list-unstyled mb-0">
                  {formData.selectedAssignees.map((memberId, index) => {
                    const member = availableMembers.find(m => m.member_id === memberId);
                    return (
                      <li key={memberId} className="mb-2">
                        {member?.full_name}
                        {index === 0 && <span className="badge bg-primary ms-2">Primary</span>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}

          <div className="card mt-3">
            <div className="card-header">
              <h5 className="mb-0">Tips</h5>
            </div>
            <div className="card-body">
              <ul className="small mb-0">
                <li>Use clear, action-oriented task names</li>
                <li>Break down large tasks into smaller ones</li>
                <li>Assign to team members for accountability</li>
                <li>Set realistic due dates</li>
                <li>The first selected assignee is the primary owner</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}