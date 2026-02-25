// frontend/src/pages/ProjectsList.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'completed', 'abandoned'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projectsRes, teamsRes] = await Promise.all([
        api.get("/projects"),
        api.get("/teams")
      ]);
      setProjects(projectsRes.data || []);
      setTeams(teamsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Categorize projects by status
  const activeProjects = projects.filter(p => 
    p.status === 'Planning' || p.status === 'In Progress'
  );
  const completedProjects = projects.filter(p => p.status === 'Completed');
  const abandonedProjects = projects.filter(p => p.status === 'On Hold');

  // Group projects by team
  const groupProjectsByTeam = (projectList) => {
    const grouped = {};
    const unassigned = [];

    projectList.forEach(project => {
      if (project.teams) {
        // Split teams if multiple
        const teamList = project.teams.split(', ');
        teamList.forEach(team => {
          if (!grouped[team]) {
            grouped[team] = [];
          }
          grouped[team].push(project);
        });
      } else {
        unassigned.push(project);
      }
    });

    // Add unassigned if exists
    if (unassigned.length > 0) {
      grouped['Unassigned'] = unassigned;
    }

    return grouped;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Planning': return 'bg-secondary';
      case 'In Progress': return 'bg-primary';
      case 'Completed': return 'bg-success';
      case 'On Hold': return 'bg-danger';
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

  const renderProjectCard = (project) => (
    <div key={project.project_id} className="col-md-6 col-lg-4 mb-3">
      <div className="card h-100">
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{project.project_name}</h5>
          <p className="card-text text-muted small" style={{ flexGrow: 1 }}>
            {project.description || "No description"}
          </p>
          
          <div className="mb-3">
            <span className={`badge ${getStatusBadgeClass(project.status)} me-2`}>
              {project.status}
            </span>
            <span className={`badge ${getPriorityBadgeClass(project.priority)}`}>
              {project.priority}
            </span>
          </div>

          {(project.start_date || project.end_date) && (
            <div className="small text-muted mb-3">
              {project.start_date && (
                <div>Started: {new Date(project.start_date).toLocaleDateString()}</div>
              )}
              {project.end_date && (
                <div>Due: {new Date(project.end_date).toLocaleDateString()}</div>
              )}
            </div>
          )}

          <div className="mt-auto">
            <Link to={`/projects/${project.project_id}`} className="btn btn-outline-primary btn-sm w-100">
              View Project
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProjectSection = (projectList, emptyMessage) => {
    if (projectList.length === 0) {
      return (
        <div className="alert alert-info">
          {emptyMessage}
        </div>
      );
    }

    const groupedProjects = groupProjectsByTeam(projectList);

    return (
      <>
        {Object.entries(groupedProjects).map(([teamName, teamProjects]) => (
          <div key={teamName} className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">
                {teamName}
                <span className="badge bg-secondary ms-2">{teamProjects.length}</span>
              </h4>
            </div>
            <div className="row">
              {teamProjects.map(renderProjectCard)}
            </div>
          </div>
        ))}
      </>
    );
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Projects</h2>
        <Link to="/projects/new" className="btn btn-primary">
          Create Project
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="mb-0">{activeProjects.length}</h3>
              <small className="text-muted">Active Projects</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="mb-0">{completedProjects.length}</h3>
              <small className="text-muted">Completed Projects</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="mb-0">{abandonedProjects.length}</h3>
              <small className="text-muted">On Hold Projects</small>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active Projects ({activeProjects.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed ({completedProjects.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'abandoned' ? 'active' : ''}`}
            onClick={() => setActiveTab('abandoned')}
          >
            On Hold ({abandonedProjects.length})
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      {activeTab === 'active' && renderProjectSection(
        activeProjects,
        "No active projects. Create a new project to get started!"
      )}

      {activeTab === 'completed' && renderProjectSection(
        completedProjects,
        "No completed projects yet."
      )}

      {activeTab === 'abandoned' && renderProjectSection(
        abandonedProjects,
        "No projects on hold."
      )}
    </div>
  );
}