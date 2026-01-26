// frontend/src/pages/SealClanLife.jsx
import { useEffect, useState } from "react";
import api from "../api/api";

export default function SealClanLife() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const res = await api.get("/members");
      setMembers(res.data || []);
    } catch (err) {
      console.error("Failed to load members:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique roles for filter
  const roles = ["All", ...new Set(members.map(m => m.role))];

  // Filter members based on search and role filter
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.teams && member.teams.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = filterRole === "All" || member.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'Admin': return 'bg-danger';
      case 'Team Lead': return 'bg-primary';
      case 'Associate': return 'bg-secondary';
      default: return 'bg-secondary';
    }
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
        <h2>SEAL Clan Life</h2>
        <span className="badge bg-primary fs-6">{filteredMembers.length} Members</span>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, email, or team..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="alert alert-info">
          No members found matching your search criteria.
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Team(s)</th>
                  <th>Major</th>
                  <th>Year</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.member_id}>
                    <td className="text-muted">#{member.member_id}</td>
                    <td>
                      <strong>{member.full_name}</strong>
                    </td>
                    <td className="text-muted small">{member.email}</td>
                    <td>
                      <span className={`badge ${getRoleBadgeClass(member.role)}`}>
                        {member.role}
                      </span>
                    </td>
                    <td>
                      {member.teams ? (
                        <span className="text-primary">{member.teams}</span>
                      ) : (
                        <span className="text-muted fst-italic">No team</span>
                      )}
                    </td>
                    <td className="text-muted small">{member.major || '—'}</td>
                    <td className="text-muted small">{member.year_level || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-4">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Role Breakdown</h5>
            <div className="row text-center">
              {roles.filter(r => r !== "All").map(role => {
                const count = members.filter(m => m.role === role).length;
                return (
                  <div key={role} className="col-md-4 mb-3">
                    <div className="border rounded p-3">
                      <h3 className="mb-0">{count}</h3>
                      <small className="text-muted">{role}</small>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}