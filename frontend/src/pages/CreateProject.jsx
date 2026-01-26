// frontend/src/pages/CreateProject.jsx
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/api";

export default function CreateProject() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    project_name: "",
    description: "",
    status: "Planning",
    priority: "Medium",
    start_date: "",
    end_date: "",
    total_tasks_target: "42"
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Check if user has Team Lead or Admin role
  if (user?.role !== 'Team Lead' && user?.role !== 'Admin') {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h4>Access Denied</h4>
          <p>Only Team Leads and Administrators can create projects.</p>
        </div>
        <Link to="/projects" className="btn btn-primary">Back to Projects</Link>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!formData.project_name.trim()) {
      setError("Project name is required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        project_name: formData.project_name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        total_tasks_target: parseInt(formData.total_tasks_target) || 42
      };

      const res = await api.post('/projects', payload);
      
      // Redirect to the new project page
      navigate(`/projects/${res.data.project_id}`);
    } catch (err) {
      console.error("Failed to create project:", err);
      setError(err.response?.data?.error || "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/projects">Projects</Link>
          </li>
          <li className="breadcrumb-item active">Create Project</li>
        </ol>
      </nav>

      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h4 className="mb-0">Create New Project</h4>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger">{error}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Project Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    name="project_name"
                    value={formData.project_name}
                    onChange={handleChange}
                    required
                    placeholder="Enter project name"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Describe the project goals and objectives"
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="Planning">Planning</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>

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
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Target Number of Tasks</label>
                  <input
                    type="number"
                    className="form-control"
                    name="total_tasks_target"
                    value={formData.total_tasks_target}
                    onChange={handleChange}
                    min="1"
                    placeholder="42"
                  />
                  <div className="form-text">YBR Quest standard is 42 tasks</div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? "Creating..." : "Create Project"}
                  </button>
                  <Link
                    to="/projects"
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
              <h5 className="mb-0">Project Guidelines</h5>
            </div>
            <div className="card-body">
              <ul className="small mb-0">
                <li>Choose a clear, descriptive project name</li>
                <li>Set realistic timelines for completion</li>
                <li>Assign teams to the project after creation</li>
                <li>Break down the project into manageable tasks</li>
                <li>Monitor progress through the YBR system</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}