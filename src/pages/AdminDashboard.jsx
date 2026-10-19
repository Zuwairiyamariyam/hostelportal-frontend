import React, { useState, useEffect, useMemo } from 'react';
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
  RefreshCw,
  Building,
  Search,
  CheckCircle,
  FileCheck2
} from 'lucide-react';
import './AdminDashboard.css';

const API_BASE = 'https://hostelportal-backend-7buv.onrender.com/api';

const STATUS_OPTIONS = [
  { value: 'ACKNOWLEDGED', label: 'Acknowledged (Complaint logged)' },
  { value: 'UNDER_REVIEW', label: 'Under Review (Warden / Tech assigned)' },
  { value: 'ACTION_TAKEN', label: 'Action Taken (Maintenance work in progress)' },
  { value: 'RESOLVED', label: 'Resolved (Work verified & complete)' },
  { value: 'REJECTED', label: 'Rejected (Invalid issue)' }
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Persistent Tab on Local Storage
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('admin_active_tab') || 'overview';
  });

  const [stats, setStats] = useState({ totalStudents: 0, totalRooms: 0, pendingComplaints: 0, resolvedComplaints: 0, urgentComplaints: 0 });
  const [complaints, setComplaints] = useState([]);
  const [students, setStudents] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 🎯 Track seen resolutions count (Persists permanently like Student Notifications)
  const [seenResolvedCount, setSeenResolvedCount] = useState(() => {
    return Number(localStorage.getItem('admin_seen_resolved_count') || 0);
  });

  // Status Update Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('UNDER_REVIEW');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [adminRemark, setAdminRemark] = useState('');

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchQuery('');
    localStorage.setItem('admin_active_tab', tabName);

    // Once Resolutions tab is opened, mark all currently resolved complaints as seen
    if (tabName === 'resolved') {
      const currentResolved = complaints.filter(c => c.status === 'RESOLVED').length;
      setSeenResolvedCount(currentResolved);
      localStorage.setItem('admin_seen_resolved_count', currentResolved.toString());
    }
  };

  const fetchAdminData = () => {
    const req1 = axios.get(`${API_BASE}/admin/dashboard-stats`);
    const req2 = axios.get(`${API_BASE}/complaints`);
    const req3 = axios.get(`${API_BASE}/students`);

    Promise.allSettled([req1, req2, req3])
      .then(([resStats, resCmp, resStd]) => {
        if (resStats.status === 'fulfilled') setStats(resStats.value.data);
        if (resCmp.status === 'fulfilled') {
          const fetchedComplaints = resCmp.value.data || [];
          setComplaints(fetchedComplaints);

          // If currently inside resolutions tab, keep it marked seen
          if (activeTab === 'resolved') {
            const currentResolved = fetchedComplaints.filter(c => c.status === 'RESOLVED').length;
            setSeenResolvedCount(currentResolved);
            localStorage.setItem('admin_seen_resolved_count', currentResolved.toString());
          }
        }
        if (resStd.status === 'fulfilled' && Array.isArray(resStd.value.data)) {
          setStudents(resStd.value.data);
        }
      })
      .finally(() => {
        setInitialLoading(false);
      });
  };

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'ADMIN') {
      navigate('/');
      return;
    }
    fetchAdminData();
  }, [navigate]);

  // Full Page Refresh
  const handleFullPageRefresh = () => {
    localStorage.setItem('admin_active_tab', activeTab);
    window.location.reload();
  };

  const getJoiningAndBatch = (year) => {
    const yr = Number(year);
    switch (yr) {
      case 1:
        return { joiningDate: '24.08.2026', batch: '2026 - 2030' };
      case 2:
        return { joiningDate: '18.08.2025', batch: '2025 - 2029' };
      case 3:
        return { joiningDate: '21.08.2024', batch: '2024 - 2028' };
      case 4:
      default:
        return { joiningDate: '16.08.2023', batch: '2023 - 2027' };
    }
  };

  // Boys Students List (A-Z Sorted)
  const boysStudents = useMemo(() => {
    return students
      .filter(s => {
        const room = (s.roomNo || '').toUpperCase();
        const gen = (s.gender || '').toUpperCase();
        return room.startsWith('BH') || gen === 'MALE' || gen === 'BOY';
      })
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [students]);

  // Girls Students List (A-Z Sorted)
  const girlsStudents = useMemo(() => {
    return students
      .filter(s => {
        const room = (s.roomNo || '').toUpperCase();
        const gen = (s.gender || '').toUpperCase();
        return room.startsWith('LH') || gen === 'FEMALE' || gen === 'GIRL';
      })
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [students]);

  // Unique Rooms calculation
  const roomGroups = useMemo(() => {
    const groups = {};
    students.forEach(s => {
      const room = s.roomNo || 'Unassigned';
      if (!groups[room]) {
        groups[room] = [];
      }
      groups[room].push(s);
    });
    return groups;
  }, [students]);

  const totalCalculatedRooms = Object.keys(roomGroups).filter(r => r !== 'Unassigned').length || stats.totalRooms || 24;
  const boysRoomsCount = Object.keys(roomGroups).filter(r => r.toUpperCase().startsWith('BH')).length || 16;
  const girlsRoomsCount = Object.keys(roomGroups).filter(r => r.toUpperCase().startsWith('LH')).length || 8;

  // Filtered Lists by Search
  const filteredBoys = boysStudents.filter(s => 
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.rollNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.roomNo || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGirls = girlsStudents.filter(s => 
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.rollNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.roomNo || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Resolved & Pending Grievances
  const resolvedList = complaints.filter(c => c.status === 'RESOLVED');
  const pendingQueue = complaints.filter(c => c.status !== 'RESOLVED');

  // 🎯 Calculate genuine unread resolution count
  const unreadResolutionsCount = Math.max(0, resolvedList.length - seenResolvedCount);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      await axios.put(`${API_BASE}/complaints/${selectedComplaint.id}/status`, {
        status: newStatus,
        message: adminRemark || `Status updated to ${newStatus} by Hostel Administration`,
        updatedBy: 'HOSTEL_ADMIN'
      });

      alert(`Complaint #${selectedComplaint.complaintNumber} marked as ${newStatus}!`);
      setSelectedComplaint(null);
      setAdminRemark('');
      setStatusDropdownOpen(false);
      fetchAdminData();
    } catch (err) {
      alert('Failed to update status. Check backend connection!');
    }
  };

  // 🎯 Clean Logout: Clears login credentials but preserves seen resolution count
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('role');
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
              <small>Central Administration</small>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => handleTabChange('overview')}
            >
              <span className="nav-icon"><LayoutDashboard size={18} /></span>
              <span className="nav-label">Overview</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'boys' ? 'active' : ''}`}
              onClick={() => handleTabChange('boys')}
            >
              <span className="nav-icon"><Building size={18} /></span>
              <span className="nav-label">Boys Hostel</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'girls' ? 'active' : ''}`}
              onClick={() => handleTabChange('girls')}
            >
              <span className="nav-icon"><Building size={18} /></span>
              <span className="nav-label">Girls Hostel</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'rooms' ? 'active' : ''}`}
              onClick={() => handleTabChange('rooms')}
            >
              <span className="nav-icon"><DoorClosed size={18} /></span>
              <span className="nav-label">Hostel Rooms</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'resolved' ? 'active' : ''}`}
              onClick={() => handleTabChange('resolved')}
            >
              <span className="nav-icon"><FileCheck2 size={18} /></span>
              <span className="nav-label">Resolutions</span>
              {/* Badge count will permanently stay cleared once viewed */}
              {unreadResolutionsCount > 0 && activeTab !== 'resolved' && (
                <span className="badge-count" style={{ backgroundColor: '#059669' }}>
                  {unreadResolutionsCount}
                </span>
              )}
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
            <h1>Hostel Administration Desk</h1>
            <p style={{ margin: '4px 0 0 0', color: '#6B7280', fontSize: '13px', fontWeight: 600 }}>
              Live portal monitoring, hostel room allotments, student records, and grievance management.
            </p>
          </div>

          <button 
            type="button"
            onClick={handleFullPageRefresh} 
            className="admin-refresh-btn"
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: OVERVIEW & LIVE QUEUE */}
        {/* ============================================================ */}
        {activeTab === 'overview' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', marginBottom: '28px' }}>
              
              <div className="card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <small style={{ fontWeight: 800, color: '#6B7280', fontSize: '11px', letterSpacing: '0.8px' }}>TOTAL STUDENTS</small>
                    <h2 style={{ fontSize: '28px', fontWeight: 900, margin: '6px 0 0 0', color: '#111827' }}>{students.length || stats.totalStudents}</h2>
                  </div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#FDE8EB', color: '#7A1424', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={24} />
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <small style={{ fontWeight: 800, color: '#6B7280', fontSize: '11px', letterSpacing: '0.8px' }}>ALLOCATED ROOMS</small>
                    <h2 style={{ fontSize: '28px', fontWeight: 900, margin: '6px 0 0 0', color: '#111827' }}>{totalCalculatedRooms}</h2>
                  </div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#FDE8EB', color: '#7A1424', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DoorClosed size={24} />
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <small style={{ fontWeight: 800, color: '#92400E', fontSize: '11px', letterSpacing: '0.8px' }}>PENDING TICKETS</small>
                    <h2 style={{ fontSize: '28px', fontWeight: 900, margin: '6px 0 0 0', color: '#D97706' }}>{pendingQueue.length}</h2>
                  </div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={24} />
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <small style={{ fontWeight: 800, color: '#065F46', fontSize: '11px', letterSpacing: '0.8px' }}>RESOLVED ISSUES</small>
                    <h2 style={{ fontSize: '28px', fontWeight: 900, margin: '6px 0 0 0', color: '#059669' }}>{resolvedList.length}</h2>
                  </div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={24} />
                  </div>
                </div>
              </div>

            </div>

            <div className="card">
              <div className="card-header-row">
                <h3><AlertTriangle size={18} color="#7A1424" /> Active Student Grievance Queue</h3>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#4B5563' }}>Queue: {pendingQueue.length} Pending</span>
              </div>

              {pendingQueue.length === 0 ? (
                <p style={{ color: '#4B5563', padding: '24px 0', fontWeight: 600 }}>
                  {initialLoading ? '' : 'All grievances resolved! The hostel is running smoothly.'}
                </p>
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
                    {pendingQueue.map(c => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 900, color: '#7A1424' }}>#{c.complaintNumber}</td>
                        <td style={{ fontWeight: 800 }}>{c.roomNo}</td>
                        <td style={{ maxWidth: '320px' }}>{c.description}</td>
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
                        <td style={{ color: '#4B5563', fontSize: '12.5px' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button 
                            onClick={() => { setSelectedComplaint(c); setNewStatus(c.status); setStatusDropdownOpen(false); }}
                            style={{ 
                              padding: '7px 16px', 
                              borderRadius: '10px', 
                              border: 'none', 
                              backgroundColor: '#7A1424', 
                              color: '#fff', 
                              fontWeight: 800, 
                              fontSize: '11.5px', 
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(122, 20, 36, 0.25)'
                            }}
                          >
                            Resolve →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ============================================================ */}
        {/* TAB 2: BOYS HOSTEL STUDENTS */}
        {/* ============================================================ */}
        {activeTab === 'boys' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }}>
              <div className="card" style={{ padding: '18px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <small style={{ fontWeight: 800, color: '#6B7280', fontSize: '11px', letterSpacing: '0.8px' }}>TOTAL BOYS STUDENTS</small>
                    <h2 style={{ fontSize: '28px', fontWeight: 900, margin: '6px 0 0 0', color: '#111827' }}>{boysStudents.length}</h2>
                  </div>
                  <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: '#DBEAFE', color: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={24} />
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: '18px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <small style={{ fontWeight: 800, color: '#6B7280', fontSize: '11px', letterSpacing: '0.8px' }}>BOYS HOSTEL ROOMS</small>
                    <h2 style={{ fontSize: '28px', fontWeight: 900, margin: '6px 0 0 0', color: '#111827' }}>{boysRoomsCount}</h2>
                  </div>
                  <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: '#FDE8EB', color: '#7A1424', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DoorClosed size={24} />
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header-row" style={{ alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>
                  <Building size={18} color="#7A1424" /> Boys Hostel Residents Directory
                </h3>

                <div className="clean-search-box-wrap">
                  <Search size={15} color="#9CA3AF" />
                  <input 
                    type="text"
                    placeholder="Search by student name, roll number, or room"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <table className="table-container table-with-vertical-lines">
                <thead>
                  <tr>
                    <th>STUDENT NAME</th>
                    <th>REGISTER NO</th>
                    <th>ALLOTTED ROOM</th>
                    <th>JOINING DATE</th>
                    <th>DEPARTMENT</th>
                    <th>BATCH</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBoys.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#6B7280' }}>
                        {initialLoading ? '' : 'No boy students match your search.'}
                      </td>
                    </tr>
                  ) : (
                    filteredBoys.map(s => {
                      const meta = getJoiningAndBatch(s.year);
                      return (
                        <tr key={s.id}>
                          <td style={{ fontWeight: 800, color: '#111827' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ 
                                width: '32px', 
                                height: '32px', 
                                borderRadius: '50%', 
                                backgroundColor: '#FDE8EB', 
                                color: '#7A1424', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontWeight: 900,
                                fontSize: '13px'
                              }}>
                                {s.name ? s.name.charAt(0).toUpperCase() : 'B'}
                              </span>
                              <span>{s.name}</span>
                            </div>
                          </td>
                          <td style={{ fontWeight: 800, color: '#7A1424', fontFamily: 'monospace' }}>{s.rollNo}</td>
                          <td>
                            <span style={{ background: '#F3F4F6', padding: '4px 10px', borderRadius: '8px', fontWeight: 800 }}>
                              {s.roomNo || 'BH-Unassigned'}
                            </span>
                          </td>
                          <td style={{ color: '#4B5563', fontWeight: 600 }}>{meta.joiningDate}</td>
                          <td style={{ fontWeight: 700, color: '#111827' }}>{s.department || 'B.E. CSE'}</td>
                          <td style={{ fontWeight: 700, color: '#6B7280' }}>{meta.batch}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: GIRLS HOSTEL STUDENTS */}
        {/* ============================================================ */}
        {activeTab === 'girls' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }}>
              <div className="card" style={{ padding: '18px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <small style={{ fontWeight: 800, color: '#6B7280', fontSize: '11px', letterSpacing: '0.8px' }}>TOTAL GIRLS STUDENTS</small>
                    <h2 style={{ fontSize: '28px', fontWeight: 900, margin: '6px 0 0 0', color: '#111827' }}>{girlsStudents.length}</h2>
                  </div>
                  <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: '#FCE7EB', color: '#7A1424', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={24} />
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: '18px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <small style={{ fontWeight: 800, color: '#6B7280', fontSize: '11px', letterSpacing: '0.8px' }}>GIRLS HOSTEL ROOMS</small>
                    <h2 style={{ fontSize: '28px', fontWeight: 900, margin: '6px 0 0 0', color: '#111827' }}>{girlsRoomsCount}</h2>
                  </div>
                  <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: '#FDE8EB', color: '#7A1424', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DoorClosed size={24} />
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header-row" style={{ alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>
                  <Building size={18} color="#7A1424" /> Girls Hostel Residents Directory
                </h3>

                <div className="clean-search-box-wrap">
                  <Search size={15} color="#9CA3AF" />
                  <input 
                    type="text"
                    placeholder="Search by student name, roll number, or room"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <table className="table-container table-with-vertical-lines">
                <thead>
                  <tr>
                    <th>STUDENT NAME</th>
                    <th>REGISTER NO</th>
                    <th>ALLOTTED ROOM</th>
                    <th>JOINING DATE</th>
                    <th>DEPARTMENT</th>
                    <th>BATCH</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGirls.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#6B7280' }}>
                        {initialLoading ? '' : 'No girl students match your search.'}
                      </td>
                    </tr>
                  ) : (
                    filteredGirls.map(s => {
                      const meta = getJoiningAndBatch(s.year);
                      return (
                        <tr key={s.id}>
                          <td style={{ fontWeight: 800, color: '#111827' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ 
                                width: '32px', 
                                height: '32px', 
                                borderRadius: '50%', 
                                backgroundColor: '#FDE8EB', 
                                color: '#7A1424', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontWeight: 900,
                                fontSize: '13px'
                              }}>
                                {s.name ? s.name.charAt(0).toUpperCase() : 'G'}
                              </span>
                              <span>{s.name}</span>
                            </div>
                          </td>
                          <td style={{ fontWeight: 800, color: '#7A1424', fontFamily: 'monospace' }}>{s.rollNo}</td>
                          <td>
                            <span style={{ background: '#F3F4F6', padding: '4px 10px', borderRadius: '8px', fontWeight: 800 }}>
                              {s.roomNo || 'LH-Unassigned'}
                            </span>
                          </td>
                          <td style={{ color: '#4B5563', fontWeight: 600 }}>{meta.joiningDate}</td>
                          <td style={{ fontWeight: 700, color: '#111827' }}>{s.department || 'B.E. CSE'}</td>
                          <td style={{ fontWeight: 700, color: '#6B7280' }}>{meta.batch}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: ROOMS MATRIX & OCCUPANCY */}
        {/* ============================================================ */}
        {activeTab === 'rooms' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <div className="card-header-row">
                <div>
                  <h3><DoorClosed size={18} color="#7A1424" /> Hostel Room Occupancy Overview</h3>
                  <small style={{ color: '#6B7280', fontWeight: 600 }}>Boys Hostel & Girls Hostel Room Allocations</small>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ background: '#ECFDF5', color: '#065F46', padding: '4px 12px', borderRadius: '12px', fontWeight: 800, fontSize: '11px' }}>
                    Available / Normal (4 Pax)
                  </span>
                  <span style={{ background: '#FEF2F2', color: '#991B1B', padding: '4px 12px', borderRadius: '12px', fontWeight: 800, fontSize: '11px' }}>
                    Full (4/4)
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px', marginTop: '12px' }}>
                {Object.entries(roomGroups).map(([roomNumber, occupants]) => {
                  const isBoys = roomNumber.toUpperCase().startsWith('BH');
                  const count = occupants.length;
                  const isFull = count >= 4;

                  return (
                    <div 
                      key={roomNumber} 
                      style={{ 
                        border: '1.5px solid #E5E7EB', 
                        borderRadius: '16px', 
                        padding: '18px',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ 
                            background: isBoys ? '#DBEAFE' : '#FCE7EB', 
                            color: isBoys ? '#1E40AF' : '#7A1424',
                            padding: '4px 8px',
                            borderRadius: '8px',
                            fontWeight: 900,
                            fontSize: '11px'
                          }}>
                            {isBoys ? 'BOYS HOSTEL' : 'GIRLS HOSTEL'}
                          </span>
                          <strong style={{ fontSize: '15px', color: '#111827' }}>{roomNumber}</strong>
                        </div>
                        <span style={{ 
                          fontSize: '11.5px', 
                          fontWeight: 900, 
                          color: isFull ? '#DC2626' : '#059669',
                          background: isFull ? '#FEE2E2' : '#D1FAE5',
                          padding: '3px 8px',
                          borderRadius: '10px'
                        }}>
                          {count}/4 Occupants
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {occupants.map((occ, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#374151', padding: '4px 0', borderBottom: '1px dashed #F3F4F6' }}>
                            <span style={{ fontWeight: 700 }}>{occ.name}</span>
                            <span style={{ fontFamily: 'monospace', color: '#7A1424', fontWeight: 800 }}>{occ.rollNo}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: RESOLVED GRIEVANCES ARCHIVE */}
        {/* ============================================================ */}
        {activeTab === 'resolved' && (
          <div className="card">
            <div className="card-header-row">
              <h3><FileCheck2 size={18} color="#7A1424" /> Solved Grievance Resolution Archive</h3>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#059669', background: '#D1FAE5', padding: '4px 12px', borderRadius: '20px' }}>
                {resolvedList.length} Solved Records
              </span>
            </div>

            {resolvedList.length === 0 ? (
              <p style={{ color: '#4B5563', padding: '24px 0', fontWeight: 600 }}>
                {initialLoading ? '' : 'No complaints have been resolved yet.'}
              </p>
            ) : (
              <table className="table-container">
                <thead>
                  <tr>
                    <th>CMP ID</th>
                    <th>Room</th>
                    <th>Issue Description</th>
                    <th>Priority</th>
                    <th>Resolution Status</th>
                    <th>Resolved Date</th>
                  </tr>
                </thead>
                <tbody>
                  {resolvedList.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 900, color: '#7A1424' }}>#{c.complaintNumber}</td>
                      <td style={{ fontWeight: 800 }}>{c.roomNo}</td>
                      <td style={{ maxWidth: '340px' }}>{c.description}</td>
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
                        <span className="status-pill status-RESOLVED" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={12} /> RESOLVED
                        </span>
                      </td>
                      <td style={{ color: '#4B5563', fontSize: '12.5px' }}>{new Date(c.updatedAt || c.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </main>

      {/* ============================================================ */}
      {/* 🌟 CURVED CUSTOM DROPDOWN RESOLUTION MODAL */}
      {/* ============================================================ */}
      {selectedComplaint && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div className="card-header-row">
              <h3><ShieldCheck size={20} color="#7A1424" /> Resolve Complaint #{selectedComplaint.complaintNumber}</h3>
              <button 
                type="button"
                onClick={() => { setSelectedComplaint(null); setStatusDropdownOpen(false); }} 
                style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', fontWeight: 900 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStatusUpdate}>
              <div style={{ marginBottom: '18px', background: '#F8F9FA', border: '1.5px solid #E5E7EB', padding: '14px 18px', borderRadius: '14px' }}>
                <div style={{ fontSize: '13px', color: '#111827', fontWeight: 800, marginBottom: '4px' }}>
                  Room: {selectedComplaint.roomNo} • Urgency: {selectedComplaint.priority}
                </div>
                <div style={{ fontSize: '13px', color: '#4B5563', lineHeight: '1.4' }}>
                  "{selectedComplaint.description}"
                </div>
              </div>

              <div className="form-group" style={{ position: 'relative', zIndex: 100 }}>
                <label>Update Action Status</label>
                
                <div 
                  className={`custom-select-trigger ${statusDropdownOpen ? 'open' : ''}`}
                  onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                >
                  <span>{STATUS_OPTIONS.find(o => o.value === newStatus)?.label || 'Select Status'}</span>
                  <span className={`dropdown-arrow ${statusDropdownOpen ? 'rotate' : ''}`}>▾</span>
                </div>

                {statusDropdownOpen && (
                  <div className="custom-dropdown-menu">
                    {STATUS_OPTIONS.map(opt => (
                      <div 
                        key={opt.value} 
                        className={`custom-dropdown-item ${newStatus === opt.value ? 'active-text' : ''}`}
                        onClick={() => {
                          setNewStatus(opt.value);
                          setStatusDropdownOpen(false);
                        }}
                      >
                        {opt.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Resolution Remarks / Message to Student</label>
                <textarea 
                  className="auto-adjust-textarea"
                  rows="3"
                  placeholder="e.g. Electrician fixed switchboard at 4:30 PM."
                  required
                  value={adminRemark}
                  onChange={(e) => setAdminRemark(e.target.value)}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button 
                  type="button" 
                  onClick={() => { setSelectedComplaint(null); setStatusDropdownOpen(false); }} 
                  style={{ padding: '10px 22px', borderRadius: '25px', border: '1.5px solid #D1D5DB', background: '#fff', cursor: 'pointer', fontWeight: 800, color: '#374151' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="modal-submit-btn"
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