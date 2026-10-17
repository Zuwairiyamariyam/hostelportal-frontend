import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  Droplets, 
  Sparkles, 
  Zap, 
  LogOut, 
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import './WardenDashboard.css';

const DEFAULT_FACILITIES = [
  { id: 1, title: 'Morning Drinking Water', time: '06:00 AM - 09:30 AM', status: 'ACTIVE', type: 'water' },
  { id: 2, title: 'Evening Hot Water', time: '05:30 PM - 08:30 PM', status: 'SCHEDULED', type: 'water' },
  { id: 3, title: 'Room Cleaning (2nd Floor)', time: '10:00 AM - 01:00 PM', status: 'COMPLETED', type: 'cleaning' },
  { id: 4, title: 'Wi-Fi Maintenance Slot', time: '11:00 PM - 11:30 PM', status: 'SCHEDULED', type: 'maintenance' }
];

export default function WardenDashboard() {
  const navigate = useNavigate();
  const [warden, setWarden] = useState(null);
  const [facilities, setFacilities] = useState(() => {
    const saved = localStorage.getItem('hostel_facility_schedule');
    return saved ? JSON.parse(saved) : DEFAULT_FACILITIES;
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const role = localStorage.getItem('role');

    if (!storedUser || role !== 'WARDEN') {
      navigate('/');
      return;
    }

    setWarden(JSON.parse(storedUser));
  }, [navigate]);

  const updateFacilityStatus = (id, newStatus) => {
    const updated = facilities.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    );
    setFacilities(updated);
    localStorage.setItem('hostel_facility_schedule', JSON.stringify(updated));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (!warden) return null;

  const activeCount = facilities.filter(f => f.status === 'ACTIVE').length;
  const completedCount = facilities.filter(f => f.status === 'COMPLETED').length;

  return (
    <div className="warden-container">
      
      {/* Top Header */}
      <header className="warden-header">
        <div className="warden-brand">
          <div className="warden-badge">
            <Building2 size={22} />
          </div>
          <div>
            <h1>{warden.name}</h1>
            <p>{warden.hostelType === 'LADIES_HOSTEL' ? 'Girls Hostel Operations Desk' : 'Boys Hostel Operations Desk'}</p>
          </div>
        </div>

        <button className="warden-logout-btn" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </header>

      <main className="warden-main">
        
        {/* Quick Micro Stats */}
        <div className="warden-stats-row">
          <div className="warden-stat-card">
            <span className="stat-label">Active Tasks</span>
            <span className="stat-num text-green">{activeCount}</span>
          </div>
          <div className="warden-stat-card">
            <span className="stat-label">Completed Today</span>
            <span className="stat-num text-blue">{completedCount}</span>
          </div>
          <div className="warden-stat-card">
            <span className="stat-label">Total Facilities</span>
            <span className="stat-num">{facilities.length}</span>
          </div>
        </div>

        {/* Action Table Card */}
        <div className="warden-task-card">
          <div className="task-card-header">
            <div>
              <h2>Daily Facility Operations & Student Sync</h2>
              <small>Status-ah inga update pannona, student dashboard-la live-aa sync aagidum.</small>
            </div>
            <button 
              className="refresh-btn" 
              onClick={() => {
                const saved = localStorage.getItem('hostel_facility_schedule');
                if (saved) setFacilities(JSON.parse(saved));
              }}
            >
              <RefreshCw size={15} /> Refresh
            </button>
          </div>

          <div className="task-list-grid">
            {facilities.map((task) => {
              const isWater = task.type === 'water';
              const isCleaning = task.type === 'cleaning';
              const IconComp = isWater ? Droplets : isCleaning ? Sparkles : Zap;

              return (
                <div key={task.id} className={`task-item-box status-${task.status.toLowerCase()}`}>
                  <div className="task-left-info">
                    <div className="task-icon-circle">
                      <IconComp size={20} />
                    </div>
                    <div>
                      <h3>{task.title}</h3>
                      <p><Clock size={13} style={{ display: 'inline', marginRight: '4px' }} />{task.time}</p>
                    </div>
                  </div>

                  <div className="task-controls">
                    <span className={`warden-status-pill status-${task.status}`}>
                      {task.status}
                    </span>

                    <div className="btn-toggle-group">
                      <button 
                        className={`action-pill-btn ${task.status === 'SCHEDULED' ? 'active-scheduled' : ''}`}
                        onClick={() => updateFacilityStatus(task.id, 'SCHEDULED')}
                      >
                        Scheduled
                      </button>
                      <button 
                        className={`action-pill-btn ${task.status === 'ACTIVE' ? 'active-active' : ''}`}
                        onClick={() => updateFacilityStatus(task.id, 'ACTIVE')}
                      >
                        Active
                      </button>
                      <button 
                        className={`action-pill-btn ${task.status === 'COMPLETED' ? 'active-completed' : ''}`}
                        onClick={() => updateFacilityStatus(task.id, 'COMPLETED')}
                      >
                        <CheckCircle2 size={14} /> Completed
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </main>

    </div>
  );
}