import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Users, 
  DoorClosed, 
  CheckCircle2, 
  Clock, 
  LogOut,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import './StudentDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalStudents: 0, totalRooms: 0, pendingComplaints: 0, resolvedComplaints: 0, urgentComplaints: 0 });
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  // Status Update Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('UNDER_REVIEW');
  const [adminRemark, setAdminRemark] = useState('');

  const fetchAdminData = () => {
    setLoading(true);
    // 1. Fetch Dashboard Stats
    axios.get('https://hostelportal-backend-7buv.onrender.com//api/admin/dashboard-stats')
      .then(res => setStats(res.data))
      .catch(err => console.error(err));

    // 2. Fetch All Complaints
    axios.get('https://hostelportal-backend-7buv.onrender.com//api/complaints')
      .then(res => setComplaints(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'ADMIN') {
      navigate('/');
      return;
    }
    fetchAdminData();
  }, [navigate]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      await axios.put(`https://hostelportal-backend-7buv.onrender.com//api/complaints/${selectedComplaint.id}/status`, {
        status: newStatus,
        message: adminRemark || `Status updated to ${newStatus} by Admin`,
        updatedBy: 'HOSTEL_ADMIN'
      });

      alert(`Complaint #${selectedComplaint.complaintNumber} updated successfully!`);
      setSelectedComplaint(null);
      setAdminRemark('');
      fetchAdminData(); // Refresh table & stats
    } catch (err) {
      alert('Failed to update status. Check backend connection!');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      
      {/* Admin Sidebar */}
      <aside className="sidebar">
        <div>
          <div className="sidebar-header">
            <span className="brand-badge">HC</span>
            <div className="brand-text">
              <h2>Admin Desk</h2>
              <small>Hostel Administration</small>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button className="nav-item active">
              <LayoutDashboard size={18} />
              <span>Overview</span>
            </button>
          </nav>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-wrapper">
        <div className="topbar">
          <div className="topbar-title">
            <h1>Hostel Management Dashboard 🛡️</h1>
            <p>Review student complaints, update resolution status, and track hostel facilities.</p>
          </div>

          <button 
            onClick={fetchAdminData} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '8px 16px', 
              borderRadius: '20px', 
              border: '1px solid #D1D5DB', 
              backgroundColor: '#fff', 
              fontWeight: 800, 
              cursor: 'pointer' 
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {/* 4 Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', marginBottom: '28px' }}>
          
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <small style={{ fontWeight: 800, color: '#374151' }}>TOTAL STUDENTS</small>
                <h2 style={{ fontSize: '28px', fontWeight: 900, margin: '6px 0 0 0', color: '#111827' }}>{stats.totalStudents}</h2>
              </div>
              <Users size={32} color="#7A1424" />
            </div>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <small style={{ fontWeight: 800, color: '#374151' }}>TOTAL ROOMS</small>
                <h2 style={{ fontSize: '28px', fontWeight: 900, margin: '6px 0 0 0', color: '#111827' }}>{stats.totalRooms}</h2>
              </div>
              <DoorClosed size={32} color="#7A1424" />
            </div>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <small style={{ fontWeight: 800, color: '#92400E' }}>PENDING GRIEVANCES</small>
                <h2 style={{ fontSize: '28px', fontWeight: 900, margin: '6px 0 0 0', color: '#D97706' }}>{stats.pendingComplaints}</h2>
              </div>
              <Clock size={32} color="#D97706" />
            </div>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <small style={{ fontWeight: 800, color: '#065F46' }}>RESOLVED ISSUES</small>
                <h2 style={{ fontSize: '28px', fontWeight: 900, margin: '6px 0 0 0', color: '#059669' }}>{stats.resolvedComplaints}</h2>
              </div>
              <CheckCircle2 size={32} color="#059669" />
            </div>
          </div>

        </div>

        {/* Complaints Table */}
        <div className="card">
          <div className="card-header-row">
            <h3><AlertTriangle size={20} color="#7A1424" /> Student Grievance Queue</h3>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#111827' }}>Total: {complaints.length} Records</span>
          </div>

          {complaints.length === 0 ? (
            <p style={{ color: '#4B5563', padding: '20px 0' }}>No grievances submitted.</p>
          ) : (
            <table className="table-container">
              <thead>
                <tr>
                  <th>CMP ID</th>
                  <th>Room</th>
                  <th>Description</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 900, color: '#7A1424' }}>#{c.complaintNumber}</td>
                    <td>{c.roomNo}</td>
                    <td style={{ maxWidth: '280px' }}>{c.description}</td>
                    <td>
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 900,
                        color: c.priority === 'EMERGENCY' ? '#DC2626' : c.priority === 'URGENT' ? '#D97706' : '#2563EB' 
                      }}>
                        {c.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill status-${c.status}`}>{c.status}</span>
                    </td>
                    <td style={{ color: '#4B5563' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button 
                        onClick={() => { setSelectedComplaint(c); setNewStatus(c.status); }}
                        style={{ 
                          padding: '6px 14px', 
                          borderRadius: '8px', 
                          border: 'none', 
                          backgroundColor: '#7A1424', 
                          color: '#fff', 
                          fontWeight: 800, 
                          fontSize: '11px', 
                          cursor: 'pointer' 
                        }}
                      >
                        Action / Resolve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </main>

      {/* Admin Action Modal */}
      {selectedComplaint && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="card-header-row">
              <h3><ShieldCheck size={20} color="#7A1424" /> Update Complaint #{selectedComplaint.complaintNumber}</h3>
              <button 
                onClick={() => setSelectedComplaint(null)} 
                style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', fontWeight: 900 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStatusUpdate}>
              <div style={{ marginBottom: '16px', background: '#F9FAFB', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontSize: '13px', color: '#111827', fontWeight: 700 }}>
                  Room: {selectedComplaint.roomNo} | Priority: {selectedComplaint.priority}
                </div>
                <div style={{ fontSize: '13px', color: '#374151', marginTop: '4px' }}>
                  "{selectedComplaint.description}"
                </div>
              </div>

              <div className="form-group">
                <label>Change Status</label>
                <select 
                  className="form-control"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="ACKNOWLEDGED">Acknowledged (Complaint seen)</option>
                  <option value="UNDER_REVIEW">Under Review (Forwarded to Warden/Technician)</option>
                  <option value="ACTION_TAKEN">Action Taken (Maintenance in progress)</option>
                  <option value="RESOLVED">Resolved (Issue completely solved)</option>
                  <option value="REJECTED">Rejected (Invalid request)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Resolution Remarks / Message to Student</label>
                <textarea 
                  className="form-control"
                  rows="3"
                  placeholder="e.g. Plumber has replaced the tap in room 204."
                  required
                  value={adminRemark}
                  onChange={(e) => setAdminRemark(e.target.value)}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button 
                  type="button" 
                  onClick={() => setSelectedComplaint(null)} 
                  style={{ padding: '10px 20px', borderRadius: '20px', border: '1px solid #D1D5DB', background: '#fff', cursor: 'pointer', fontWeight: 700 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ 
                    padding: '10px 24px', 
                    borderRadius: '20px', 
                    border: 'none', 
                    background: '#7A1424', 
                    color: '#fff', 
                    fontWeight: 900, 
                    cursor: 'pointer' 
                  }}
                >
                  Save & Notify Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}