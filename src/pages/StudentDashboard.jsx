import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Bell, 
  Utensils, 
  LogOut, 
  User, 
  Users, 
  ShieldAlert, 
  PlusCircle, 
  Droplets, 
  Sparkles, 
  Wifi, 
  Flame,
  Refrigerator,
  CheckCircle,
  Coffee, 
  AlertCircle,
  PhoneCall
} from 'lucide-react';
import './StudentDashboard.css';

// 🎯 Display Name Mapping (Option 2 - Perfectly Symmetrical Names)
const CATEGORY_DISPLAY_MAP = {
  1: 'Room Repair',
  2: 'Water Supply',
  3: 'Mess & Food',
  4: 'House Keeping',
  5: 'Power & Light',
  6: 'Safety Concern',
  7: 'Room Conflict',
  8: 'Warden Help',
  9: 'General Query'
};

// Default categories fallback
const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Room Repair' },
  { id: 2, name: 'Water Supply' },
  { id: 3, name: 'Mess & Food' },
  { id: 4, name: 'House Keeping' },
  { id: 5, name: 'Power & Light' },
  { id: 6, name: 'Safety Concern' },
  { id: 7, name: 'Room Conflict' },
  { id: 8, name: 'Warden Help' },
  { id: 9, name: 'General Query' }
];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const [student, setStudent] = useState(null);
  const [roommates, setRoommates] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Academic Year Label Formatter
  const getYearLabel = (yr) => {
    switch (Number(yr)) {
      case 1:
        return 'First Year';
      case 2:
        return 'Second Year';
      case 3:
        return 'Third Year';
      case 4:
        return 'Final Year';
      default:
        return `Year ${yr}`;
    }
  };

  const getDepartmentFullName = (department) => {
    const departments = {
      "CSE": "B.E. Computer Science",
      "AI&DS": "B.Tech Artificial Intelligence & Data Science",
      "MECH": "B.E. Mechanical",
      "ECE": "B.E. Electronics & Communication "
    };

    return departments[department?.trim()?.toUpperCase()] || department;
  };

  // 🎯 Clean Symmetrical Display Category Name Helper
  const getCategoryName = (catId) => {
    return CATEGORY_DISPLAY_MAP[Number(catId)] || categories.find(c => c.id === Number(catId))?.name || 'General Query';
  };

  // Joining Date Helper
  const getJoiningDate = (yr) => {
    switch (Number(yr)) {
      case 4:
        return '16.08.2023';
      case 3:
        return '21.08.2024';
      case 2:
        return '18.08.2025';
      case 1:
        return '24.08.2026';
      default:
        return '01.08.2023';
    }
  };

  // 7-Days Dynamic Mess Menu Mapping
  const WEEKLY_MESS_SCHEDULE = {
    0: {
      day: 'Sunday',
      breakfast: { time: '7:30 AM - 9:00 AM', items: 'Poori with kurma' },
      lunch: { time: '12:30 PM - 2:30 PM', items: 'Chicken kulambu & Rasam, Rice, Egg' },
      snacks: { time: '5:00 PM - 6:00 PM', items: 'Tea/Coffee and Milk bun' },
      dinner: { time: '7:30 PM - 9:30 PM', items: 'Dosai and Tomato chutney' }
    },
    1: {
      day: 'Monday',
      breakfast: { time: '7:30 AM - 9:00 AM', items: 'Idly and Sambar' },
      lunch: { time: '12:30 PM - 2:30 PM', items: 'Lemon rice & Potato fry' },
      snacks: { time: '5:00 PM - 6:00 PM', items: 'Tea/Coffee and biscuit' },
      dinner: { time: '7:30 PM - 9:30 PM', items: 'Dosa and sambar' }
    },
    2: {
      day: 'Tuesday',
      breakfast: { time: '7:30 AM - 9:00 AM', items: 'Semiya and sugar' },
      lunch: { time: '12:30 PM - 2:30 PM', items: 'Veg pulav & kesari' },
      snacks: { time: '5:00 PM - 6:00 PM', items: 'Tea/Coffee and sundal' },
      dinner: { time: '7:30 PM - 9:30 PM', items: 'Chappati with kurma' }
    },
    3: {
      day: 'Wednesday',
      breakfast: { time: '7:30 AM - 9:00 AM', items: 'Venpongal, Sambar and Vadai' },
      lunch: { time: '12:30 PM - 2:30 PM', items: 'Rice , Dal , Cauliflower & Fish' },
      snacks: { time: '5:00 PM - 6:00 PM', items: 'Tea/Coffee and samosa' },
      dinner: { time: '7:30 PM - 9:30 PM', items: 'Idly and Coconut chutney' }
    },
    4: {
      day: 'Thursday',
      breakfast: { time: '7:30 AM - 9:00 AM', items: 'Upma and Coconut chutney' },
      lunch: { time: '12:30 PM - 2:30 PM', items: 'Kara kuzhambu & Egg' },
      snacks: { time: '5:00 PM - 6:00 PM', items: 'Tea/Coffee and Sweet bun' },
      dinner: { time: '7:30 PM - 9:30 PM', items: 'Curdrice and Potato fry' }
    },
    5: {
      day: 'Friday',
      breakfast: { time: '7:30 AM - 9:00 AM', items: 'Idiyappam and kurma' },
      lunch: { time: '12:30 PM - 2:30 PM', items: 'Sambar rice, Appalam & Vazhakai fry' },
      snacks: { time: '5:00 PM - 6:00 PM', items: 'Tea/Coffee and Veg puffs' },
      dinner: { time: '7:30 PM - 9:30 PM', items: 'Parotta and salna' }
    },
    6: {
      day: 'Saturday',
      breakfast: { time: '7:30 AM - 9:00 AM', items: 'Dosa and Coconut chutney' },
      lunch: { time: '12:30 PM - 2:30 PM', items: 'Rice , Rasam & beetroot' },
      snacks: { time: '5:00 PM - 6:00 PM', items: 'Tea/Coffee and Veg pakkoda' },
      dinner: { time: '7:30 PM - 9:30 PM', items: 'Fried Rice' }
    }
  };

  const currentDayIndex = new Date().getDay();
  const messMenu = WEEKLY_MESS_SCHEDULE[currentDayIndex];

  // 3x2 Grid Balanced Amenities list
  const amenitiesList = [
    { 
      id: 1, 
      title: '24x7 Water Supply', 
      desc: 'Purified drinking & utility water non-stop', 
      tag: 'Continuous',
      icon: Droplets 
    },
    { 
      id: 2, 
      title: 'High-Speed Wi-Fi', 
      desc: 'Campus broadband coverage for all rooms', 
      tag: '5G Speed',
      icon: Wifi 
    },
    { 
      id: 3, 
      title: 'Full Board Food', 
      desc: 'Nutritious breakfast, lunch, snacks & dinner', 
      tag: '3 Meals/Day',
      icon: Utensils 
    },
    { 
      id: 4, 
      title: 'Hot Water Facility', 
      desc: 'Instant geysers & solar hot water on demand', 
      tag: 'Instant Geyser',
      icon: Flame 
    },
    { 
      id: 5, 
      title: 'Daily Housekeeping', 
      desc: 'Room cleaning & routine dustbin clearance', 
      tag: 'Daily Routine',
      icon: Sparkles 
    },
    { 
      id: 6, 
      title: 'Kitchen Refrigerator', 
      desc: 'Common fridge access for hostel residents', 
      tag: 'Shared Access',
      icon: Refrigerator 
    }
  ];

  const fetchStudentData = (userData) => {
    axios.get(`https://hostelportal-backend-7buv.onrender.com/api/students/${userData.id}/roommates`)
      .then(res => setRoommates(res.data))
      .catch(err => console.log('Error fetching roommates:', err));

    axios.get(`https://hostelportal-backend-7buv.onrender.com/api/complaints/student/${userData.id}`)
      .then(res => setComplaints(res.data))
      .catch(err => console.log('Error fetching complaints:', err));

    axios.get(`https://hostelportal-backend-7buv.onrender.com/api/notifications/student/${userData.id}`)
      .then(res => setNotifications(res.data))
      .catch(err => console.log('Error fetching notifications:', err));

    axios.get('https://hostelportal-backend-7buv.onrender.com/api/categories')
      .then(res => {
        if (res.data && res.data.length > 0) {
          setCategories(res.data);
          setSelectedCategory(res.data[0].id);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const role = localStorage.getItem('role');

    if (!storedUser || role !== 'STUDENT') {
      navigate('/');
      return;
    }

    const userData = JSON.parse(storedUser);
    setStudent(userData);
    fetchStudentData(userData);

    const interval = setInterval(() => {
      axios.get(`https://hostelportal-backend-7buv.onrender.com/api/notifications/student/${userData.id}`)
        .then(res => setNotifications(res.data))
        .catch(() => {});
    }, 4000);

    return () => clearInterval(interval);
  }, [navigate]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    if (tabName === 'notifications') {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      if (student) {
        axios.put(`https://hostelportal-backend-7buv.onrender.com/api/notifications/student/${student.id}/read`).catch(() => {});
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleRaiseComplaint = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        studentId: student.id,
        categoryId: Number(selectedCategory),
        roomNo: student.roomNo,
        description: description,
        priority: priority,
        anonymous: anonymous
      };

      const res = await axios.post('https://hostelportal-backend-7buv.onrender.com/api/complaints', payload);
      
      setComplaints([res.data, ...complaints]);
      setShowModal(false);
      setDescription('');
      setPriority('NORMAL');
      setAnonymous(false);
      setDropdownOpen(false);
      alert(`Complaint #${res.data.complaintNumber} registered successfully!`);
    } catch (err) {
      alert('Failed to raise complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!student) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="dashboard-container">
      
      {/* Left Sidebar */}
      <aside className="sidebar">
        <div>
          <div className="sidebar-header">
            <span className="brand-badge">HC</span>
            <div className="brand-text">
              <h2>HostelCare</h2>
              <small>Grievance Redressal</small>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => handleTabChange('overview')}
            >
              <span className="nav-icon"><Home size={18} /></span>
              <span className="nav-label">Overview</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'complaints' ? 'active' : ''}`}
              onClick={() => handleTabChange('complaints')}
            >
              <span className="nav-icon"><FileText size={18} /></span>
              <span className="nav-label">Requests</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'facilities' ? 'active' : ''}`}
              onClick={() => handleTabChange('facilities')}
            >
              <span className="nav-icon"><Utensils size={18} /></span>
              <span className="nav-label">Services</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => handleTabChange('notifications')}
            >
              <span className="nav-icon"><Bell size={18} /></span>
              <span className="nav-label">Messages</span>
              {unreadCount > 0 && (
                <span className="badge-count">{unreadCount}</span>
              )}
            </button>
          </nav>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="main-wrapper">
        
        {/* Top Header */}
        <div className="topbar">
          <div className="topbar-title">
            <h1>Welcome, {student.name ? student.name.split(' ')[0] : 'Student'} 👋</h1>
          </div>

          <div className="helpline-pill">
            <div className="helpline-icon-wrap">
              <PhoneCall size={16} />
            </div>
            <div className="helpline-text">
              <span className="helpline-label">Hostel Desk</span>
              <span className="helpline-number">94431 82400</span>
            </div>
            <span className="helpline-active-dot" title="Desk Active 24x7"></span>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <>
            <div className="action-banner">
              <div>
                <h2>Facing Any Issues in the Hostel?</h2>
                <p>Register complaints regarding water, food, cleanliness, or room safety securely.</p>
              </div>
              <button className="raise-complaint-btn" onClick={() => { setShowModal(true); setDropdownOpen(false); }}>
                <PlusCircle size={18} />
                <span>Raise Complaint</span>
              </button>
            </div>

            <div className="overview-grid">
              
              {/* My Details Card */}
              <div className="card equal-card">
                <div className="card-header-row">
                  <h3>
                    <User size={18} color="#7A1424" /> My Details
                  </h3>
                </div>

                <div className="details-card-body">
                  <div className="detail-field">
                    <span className="detail-field-title">Register Number</span>
                    <span className="detail-field-value">{student.rollNo}</span>
                  </div>

                  <div className="detail-field">
                    <span className="detail-field-title">Year of study</span>
                    <span className="detail-field-value">
                      {getYearLabel(student.year)}
                    </span>
                  </div>

                  <div className="detail-field">
                    <span className="detail-field-title">Department</span>
                    <span className="detail-field-value department-value">
                      {getDepartmentFullName(student.department)}
                    </span>
                  </div>

                  <div className="detail-field">
                    <span className="detail-field-title">Allotted Room</span>
                    <span className="detail-field-value">{student.roomNo}</span>
                  </div>

                  <div className="detail-field">
                    <span className="detail-field-title">Parent / Guardian</span>
                    <span className="detail-field-value">xxxxx</span>
                  </div>

                  <div className="detail-field">
                    <span className="detail-field-title">Joining Date</span>
                    <span className="detail-field-value">
                      {getJoiningDate(student.year)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Roommates Card */}
              <div className="card equal-card">
                <div className="card-header-row">
                  <h3><Users size={18} color="#7A1424" /> Roommates ({student.roomNo})</h3>
                  <small style={{ color: '#111827', fontWeight: 800 }}>{roommates.length} Member(s)</small>
                </div>

                <div className="roommates-list-body">
                  {roommates.length === 0 ? (
                    <p style={{ fontSize: '13px', color: '#4B5563', margin: 'auto 0', fontWeight: 600 }}>
                      No other roommates registered in this room.
                    </p>
                  ) : (
                    roommates.map((rm) => (
                      <div key={rm.id} className="roommate-row">
                        <div className="roommate-avatar">{rm.name.charAt(0)}</div>
                        <div style={{ flexGrow: 1 }}>
                          <div style={{ fontSize: '13.5px', fontWeight: 900, color: '#111827' }}>{rm.name}</div>
                          <div style={{ fontSize: '11.5px', color: '#374151', fontWeight: 600 }}>
                            Roll No: {rm.rollNo} • {getYearLabel(rm.year)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Recent Complaints Summary with Category Column */}
            <div className="card">
              <div className="card-header-row">
                <h3><AlertCircle size={18} color="#7A1424" /> Recent Grievances</h3>
                <button 
                  onClick={() => handleTabChange('complaints')}
                  style={{ background: 'none', border: 'none', color: '#7A1424', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
                >
                  View All →
                </button>
              </div>

              {complaints.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#4B5563', padding: '10px 0', fontWeight: 600 }}>
                  No complaints submitted yet. Everything looks good!
                </p>
              ) : (
                <table className="table-container">
                  <thead>
                    <tr>
                      <th>Complaint No</th>
                      <th>Category</th>
                      <th>Room</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.slice(0, 3).map(c => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 900, color: '#7A1424' }}>#{c.complaintNumber}</td>
                        <td style={{ fontWeight: 800, color: '#111827' }}>{getCategoryName(c.categoryId)}</td>
                        <td>{c.roomNo}</td>
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
                        <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* TAB 2: MY COMPLAINTS with Category Column */}
        {activeTab === 'complaints' && (
          <div className="card">
            <div className="card-header-row">
              <h3><FileText size={18} color="#7A1424" /> My Complaints History</h3>
              <button className="raise-complaint-btn" onClick={() => { setShowModal(true); setDropdownOpen(false); }} style={{ padding: '8px 18px', fontSize: '12px' }}>
                <PlusCircle size={14} /> Raise New
              </button>
            </div>

            {complaints.length === 0 ? (
              <p style={{ color: '#4B5563', padding: '20px 0', fontWeight: 600 }}>No complaints filed.</p>
            ) : (
              <table className="table-container">
                <thead>
                  <tr>
                    <th>Complaint ID</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 900, color: '#7A1424' }}>#{c.complaintNumber}</td>
                      <td style={{ fontWeight: 800, color: '#111827' }}>{getCategoryName(c.categoryId)}</td>
                      <td style={{ maxWidth: '300px' }}>{c.description}</td>
                      <td style={{ fontWeight: 800 }}>{c.priority}</td>
                      <td>
                        <span className={`status-pill status-${c.status}`}>{c.status}</span>
                      </td>
                      <td>{new Date(c.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TAB 3: FACILITIES & MESS MENU (Modern 3x2 Balanced Layout) */}
        {activeTab === 'facilities' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <div className="card-header-row">
                <h3><Utensils size={18} color="#7A1424" /> Today's Mess Menu ({messMenu.day})</h3>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#059669', background: '#D1FAE5', padding: '4px 10px', borderRadius: '15px' }}>
                  Kitchen Active
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '10px' }}>
                <div style={{ background: '#F8F9FA', border: '1.5px solid #E5E7EB', borderRadius: '14px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7A1424', fontWeight: 900, fontSize: '14px' }}>
                    <Coffee size={16} /> BREAKFAST
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 700, margin: '4px 0 10px 0' }}>{messMenu.breakfast.time}</div>
                  <p style={{ fontSize: '13px', color: '#111827', fontWeight: 700, margin: 0, lineHeight: 1.4 }}>{messMenu.breakfast.items}</p>
                </div>

                <div style={{ background: '#F8F9FA', border: '1.5px solid #E5E7EB', borderRadius: '14px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7A1424', fontWeight: 900, fontSize: '14px' }}>
                    <Utensils size={16} /> LUNCH
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 700, margin: '4px 0 10px 0' }}>{messMenu.lunch.time}</div>
                  <p style={{ fontSize: '13px', color: '#111827', fontWeight: 700, margin: 0, lineHeight: 1.4 }}>{messMenu.lunch.items}</p>
                </div>

                <div style={{ background: '#F8F9FA', border: '1.5px solid #E5E7EB', borderRadius: '14px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7A1424', fontWeight: 900, fontSize: '14px' }}>
                    <Coffee size={16} /> EVENING SNACKS
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 700, margin: '4px 0 10px 0' }}>{messMenu.snacks.time}</div>
                  <p style={{ fontSize: '13px', color: '#111827', fontWeight: 700, margin: 0, lineHeight: 1.4 }}>{messMenu.snacks.items}</p>
                </div>

                <div style={{ background: '#F8F9FA', border: '1.5px solid #E5E7EB', borderRadius: '14px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7A1424', fontWeight: 900, fontSize: '14px' }}>
                    <Utensils size={16} /> DINNER
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 700, margin: '4px 0 10px 0' }}>{messMenu.dinner.time}</div>
                  <p style={{ fontSize: '13px', color: '#111827', fontWeight: 700, margin: 0, lineHeight: 1.4 }}>{messMenu.dinner.items}</p>
                </div>
              </div>
            </div>

            {/* Amenities Provided Card (3x2 Balanced Grid) */}
            <div className="card">
              <div className="card-header-row">
                <h3><CheckCircle size={18} color="#7A1424" /> Amenities Provided</h3>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#374151' }}>Inclusive with Hostel Stay</span>
              </div>

              <div className="amenities-grid-3x2">
                {amenitiesList.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={item.id} className="amenity-card-3x2">
                      <div className="amenity-card-top">
                        <div className="amenity-icon-box">
                          <IconComponent size={20} />
                        </div>
                        <span className="amenity-tag-badge">{item.tag}</span>
                      </div>
                      
                      <div className="amenity-card-content">
                        <h4 className="amenity-title">{item.title}</h4>
                        <p className="amenity-desc">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: NOTIFICATIONS with Category & Status Badges */}
        {activeTab === 'notifications' && (
          <div className="card">
            <div className="card-header-row">
              <h3><Bell size={18} color="#7A1424" /> Portal Updates & Notifications</h3>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#4B5563' }}>All caught up!</span>
            </div>

            {notifications.length === 0 ? (
              <p style={{ color: '#4B5563', padding: '20px 0', fontWeight: 600 }}>No notifications received.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {notifications.map(n => {
                  const hasDetails = n.message && n.message.includes('::');
                  const headerPart = hasDetails ? n.message.split('::')[0] : '';
                  const bodyPart = hasDetails ? n.message.split('::')[1] : n.message;

                  // Parse components: #CMP-XXXX • Category • Status
                  const headerTokens = headerPart ? headerPart.split('•').map(t => t.trim()) : [];
                  const cmpNo = headerTokens[0] || '';
                  const catName = headerTokens.length === 3 ? headerTokens[1] : '';
                  const statusVal = headerTokens.length === 3 ? headerTokens[2] : (headerTokens[1] || '');

                  return (
                    <div 
                      key={n.id} 
                      style={{ 
                        padding: '16px 20px', 
                        borderRadius: '14px', 
                        backgroundColor: n.isRead ? '#F9FAFB' : '#FDE8EB',
                        borderLeft: n.isRead ? '4px solid #9CA3AF' : '4px solid #7A1424',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {cmpNo ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '13px', fontWeight: 900, color: '#7A1424' }}>
                              {cmpNo}
                            </span>
                            {catName && (
                              <span style={{ 
                                fontSize: '11px', 
                                fontWeight: 800, 
                                backgroundColor: '#FDE8EB', 
                                color: '#7A1424', 
                                border: '1px solid #F8C3CD',
                                padding: '2px 8px', 
                                borderRadius: '8px' 
                              }}>
                                {catName}
                              </span>
                            )}
                            {statusVal && (
                              <span style={{ 
                                fontSize: '10.5px', 
                                fontWeight: 900, 
                                backgroundColor: '#E5E7EB', 
                                color: '#111827', 
                                padding: '2px 8px', 
                                borderRadius: '8px' 
                              }}>
                                {statusVal}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#7A1424' }}>Admin Desk Update</span>
                        )}

                        {!n.isRead && (
                          <span style={{ fontSize: '10px', fontWeight: 900, background: '#7A1424', color: '#fff', padding: '2px 8px', borderRadius: '10px' }}>
                            NEW
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginTop: '2px' }}>
                        {bodyPart}
                      </div>

                      <small style={{ color: '#6B7280', fontWeight: 600, fontSize: '11px', marginTop: '4px' }}>
                        {new Date(n.createdAt).toLocaleString()}
                      </small>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Modal with Symmetrical Category Names */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="card-header-row">
              <h3><ShieldAlert size={20} color="#7A1424" /> Raise Grievance / Complaint</h3>
              <button 
                onClick={() => { setShowModal(false); setDropdownOpen(false); }}
                style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', fontWeight: 900 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRaiseComplaint}>
              <div className="form-group" style={{ position: 'relative', zIndex: 100 }}>
                <label>Complaint Category</label>
                
                <div 
                  className={`custom-select-trigger ${dropdownOpen ? 'open' : ''}`}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span>{getCategoryName(selectedCategory)}</span>
                  <span className={`dropdown-arrow ${dropdownOpen ? 'rotate' : ''}`}>▾</span>
                </div>

                {dropdownOpen && (
                  <div className="custom-dropdown-menu">
                    {categories.map(c => (
                      <div 
                        key={c.id} 
                        className={`custom-dropdown-item ${Number(selectedCategory) === c.id ? 'active-text' : ''}`}
                        onClick={() => {
                          setSelectedCategory(c.id);
                          setDropdownOpen(false);
                        }}
                      >
                        {getCategoryName(c.id)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Priority Pills */}
              <div className="form-group">
                <label>Urgency / Priority</label>
                <div className="priority-pill-group">
                  <div 
                    className={`priority-pill normal ${priority === 'NORMAL' ? 'selected' : ''}`}
                    onClick={() => setPriority('NORMAL')}
                  >
                    <span className="dot dot-green"></span>
                    <span>Normal</span>
                  </div>

                  <div 
                    className={`priority-pill urgent ${priority === 'URGENT' ? 'selected' : ''}`}
                    onClick={() => setPriority('URGENT')}
                  >
                    <span className="dot dot-orange"></span>
                    <span>Urgent</span>
                  </div>

                  <div 
                    className={`priority-pill emergency ${priority === 'EMERGENCY' ? 'selected' : ''}`}
                    onClick={() => setPriority('EMERGENCY')}
                  >
                    <span className="dot dot-red"></span>
                    <span>Emergency</span>
                  </div>
                </div>
              </div>

              {/* Auto-adjusting Textarea */}
              <div className="form-group">
                <label>Complaint Description</label>
                <textarea 
                  className="auto-adjust-textarea"
                  rows="3"
                  placeholder="Detail your complaint clearly with room/floor references"
                  required
                  value={description}
                  onChange={handleDescriptionChange}
                ></textarea>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  id="anon"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                />
                <label htmlFor="anon" style={{ margin: 0, fontSize: '13.5px', color: '#111827', fontWeight: 700, cursor: 'pointer' }}>
                  Submit Anonymously (Identity hidden on public boards)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button 
                  type="button" 
                  onClick={() => { setShowModal(false); setDropdownOpen(false); }}
                  style={{ padding: '10px 22px', borderRadius: '25px', border: '1.5px solid #D1D5DB', background: '#fff', cursor: 'pointer', fontWeight: 800, color: '#374151' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="modal-submit-btn"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting' : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}