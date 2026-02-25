// frontend/src/pages/AdminPanel.jsx
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function AdminPanel() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingHP, setEditingHP] = useState(null);
  const [editingMedals, setEditingMedals] = useState(null);
  const [sortBy, setSortBy] = useState("name");
  const [deletingMember, setDeletingMember] = useState(null);

  useEffect(() => {
    if (user?.role !== 'Admin') {
      navigate('/dashboard');
      return;
    }
    loadMembers();
  }, [user, navigate]);

  const loadMembers = async () => {
    try {
      const res = await api.get("/members/admin/overview");
      setMembers(res.data || []);
    } catch (err) {
      console.error("Failed to load members:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateHP = async (memberId, newHP) => {
    try {
      await api.patch(`/members/${memberId}/health-points`, { 
        health_points: parseInt(newHP) 
      });
      await loadMembers();
      setEditingHP(null);
    } catch (err) {
      console.error("Failed to update HP:", err);
      alert("Failed to update health points");
    }
  };

  const handleUpdateMedals = async (memberId, newMedals) => {
    try {
      await api.patch(`/members/${memberId}/gold-medals`, { 
        gold_medals: parseInt(newMedals) 
      });
      await loadMembers();
      setEditingMedals(null);
    } catch (err) {
      console.error("Failed to update medals:", err);
      alert("Failed to update gold medals");
    }
  };

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      await api.patch(`/members/${memberId}/role`, { 
        role: newRole 
      });
      await loadMembers();
    } catch (err) {
      console.error("Failed to update role:", err);
      alert("Failed to update member role");
    }
  };

  const handleDeleteMember = async (memberId, memberName) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${memberName} from the system? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    setDeletingMember(memberId);
    try {
      await api.delete(`/members/${memberId}`);
      await loadMembers();
      alert(`${memberName} has been removed from the system.`);
    } catch (err) {
      console.error("Failed to delete member:", err);
      alert("Failed to remove member. They may have assigned tasks or team memberships.");
    } finally {
      setDeletingMember(null);
    }
  };

  const filteredMembers = members.filter(member => 
    member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.full_name.localeCompare(b.full_name);
      case "hp":
        return (b.health_points || 0) - (a.health_points || 0);
      case "medals":
        return (b.gold_medals || 0) - (a.gold_medals || 0);
      case "completed":
        return parseInt(b.completed_tasks || 0) - parseInt(a.completed_tasks || 0);
      case "stale":
        return parseInt(b.stale_tasks || 0) - parseInt(a.stale_tasks || 0);
      default:
        return 0;
    }
  });

  const getHPBadgeClass = (hp) => {
    if (hp >= 4) return 'bg-success';
    if (hp >= 2) return 'bg-warning';
    return 'bg-danger';
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'Admin': return 'bg-danger';
      case 'Team Lead': return 'bg-primary';
      case 'Associate': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  if (user?.role !== 'Admin') {
    return null;
  }

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
        <h2>Admin Panel</h2>
        <span className="badge bg-danger fs-6">Admin Only</span>
      </div>

      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h4 className="mb-0">{members.length}</h4>
              <small className="text-muted">Total Members</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h4 className="mb-0">{members.filter(m => (m.health_points || 0) <= 2).length}</h4>
              <small className="text-muted">Low HP Members</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h4 className="mb-0">{members.reduce((sum, m) => sum + parseInt(m.stale_tasks || 0), 0)}</h4>
              <small className="text-muted">Total Stale Tasks</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h4 className="mb-0">{members.reduce((sum, m) => sum + parseInt(m.completed_tasks || 0), 0)}</h4>
              <small className="text-muted">Total Completed Tasks</small>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Sort by Name</option>
                <option value="hp">Sort by HP</option>
                <option value="medals">Sort by Gold Medals</option>
                <option value="completed">Sort by Completed Tasks</option>
                <option value="stale">Sort by Stale Tasks</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th className="text-center">Completed</th>
                <th className="text-center">Ongoing</th>
                <th className="text-center">Stale</th>
                <th className="text-center">HP</th>
                <th className="text-center">Gold</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedMembers.map((member) => (
                <tr key={member.member_id}>
                  <td>
                    <div>
                      <strong>{member.full_name}</strong>
                      <div className="small text-muted">{member.email}</div>
                    </div>
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={member.role}
                      onChange={(e) => handleUpdateRole(member.member_id, e.target.value)}
                      style={{ width: '130px' }}
                    >
                      <option value="Associate">Associate</option>
                      <option value="Team Lead">Team Lead</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>
                  <td className="text-center">
                    <span className="badge bg-success">{member.completed_tasks || 0}</span>
                  </td>
                  <td className="text-center">
                    <span className="badge bg-primary">{member.ongoing_tasks || 0}</span>
                  </td>
                  <td className="text-center">
                    {parseInt(member.stale_tasks || 0) > 0 ? (
                      <span className="badge bg-danger">{member.stale_tasks}</span>
                    ) : (
                      <span className="text-muted">0</span>
                    )}
                  </td>
                  <td className="text-center">
                    {editingHP === member.member_id ? (
                      <div className="d-flex gap-1 justify-content-center">
                        <select
                          className="form-select form-select-sm"
                          style={{ width: '70px' }}
                          defaultValue={member.health_points || 0}
                          onChange={(e) => handleUpdateHP(member.member_id, e.target.value)}
                          onBlur={() => setEditingHP(null)}
                          autoFocus
                        >
                          {[0, 1, 2, 3, 4, 5].map(hp => (
                            <option key={hp} value={hp}>{hp}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <span 
                        className={`badge ${getHPBadgeClass(member.health_points || 0)}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setEditingHP(member.member_id)}
                      >
                        {member.health_points || 0}/5
                      </span>
                    )}
                  </td>
                  <td className="text-center">
                    {editingMedals === member.member_id ? (
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        style={{ width: '70px', margin: '0 auto' }}
                        min="0"
                        defaultValue={member.gold_medals || 0}
                        onBlur={(e) => handleUpdateMedals(member.member_id, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateMedals(member.member_id, e.target.value);
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <span 
                        style={{ cursor: 'pointer' }}
                        onClick={() => setEditingMedals(member.member_id)}
                      >
                        {member.gold_medals || 0}
                      </span>
                    )}
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteMember(member.member_id, member.full_name)}
                      disabled={deletingMember === member.member_id}
                    >
                      {deletingMember === member.member_id ? 'Removing...' : 'Remove'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="alert alert-warning mt-4">
        <strong>Warning:</strong> Removing a member will deactivate their account. Use this feature with caution.
      </div>
    </div>
  );
}