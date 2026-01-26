// frontend/src/pages/CreateTeam.jsx
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/api";

export default function CreateTeam() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    team_name: "",
    description: ""
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Check if user has admin role
  if (user?.role !== 'Admin') {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h4>Access Denied</h4>
          <p>Only administrators can create teams.</p>
        </div>
        <Link to="/teams" className="btn btn-primary">Back to Teams</Link>
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
    
    if (!formData.team_name.trim()) {
      setError("Team name is required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        team_name: formData.team_name.trim(),
        description: formData.description.trim()
      };

      const res = await api.post('/teams', payload);
      
      // Redirect to the new team page
      navigate(`/teams/${res.data.team_id}`);
    } catch (err) {
      console.error("Failed to create team:", err);
      setError(err.response?.data?.error || "Failed to create team");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/teams">Teams</Link>
          </li>
          <li className="breadcrumb-item active">Create Team</li>
        </ol>
      </nav>

      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h4 className="mb-0">Create New Team</h4>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger">{error}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Team Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    name="team_name"
                    value={formData.team_name}
                    onChange={handleChange}
                    required
                    placeholder="Enter team name"
                  />
                  <div className="form-text">Choose a unique, descriptive name for your team</div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Describe the team's purpose and goals"
                  />
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? "Creating..." : "Create Team"}
                  </button>
                  <Link
                    to="/teams"
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
              <h5 className="mb-0">Team Guidelines</h5>
            </div>
            <div className="card-body">
              <ul className="small mb-0">
                <li>Team names should be unique and descriptive</li>
                <li>You will be automatically set as the team leader</li>
                <li>Members can join teams after they are created</li>
                <li>Teams can be assigned to projects for collaboration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}