import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Calendar, Hash, ShieldCheck, Building2, CheckCircle2, Info } from 'lucide-react';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [portalMode, setPortalMode] = useState('MAIN'); // 'MAIN' or 'WARDEN'
  const [role, setRole] = useState('STUDENT'); // Main: 'STUDENT'/'ADMIN' | Warden: 'GIRLS_HOSTEL'/'BOYS_HOSTEL'
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form Fields
  const [studentRollNo, setStudentRollNo] = useState('');
  const [studentDob, setStudentDob] = useState('');
  const [verifiedStudentName, setVerifiedStudentName] = useState('');
  const [isRollVerified, setIsRollVerified] = useState(false);

  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Warden Login Fields
  const [wardenUsername, setWardenUsername] = useState('');
  const [wardenPassword, setWardenPassword] = useState('');

  const handleSwitchToWarden = () => {
    setPortalMode('WARDEN');
    setRole('GIRLS_HOSTEL');
    setErrorMessage('');
    setWardenUsername('');
    setWardenPassword('');
  };

  const handleSwitchToMain = () => {
    setPortalMode('MAIN');
    setRole('STUDENT');
    setErrorMessage('');
    setStudentRollNo('');
    setStudentDob('');
    setIsRollVerified(false);
    setVerifiedStudentName('');
  };

  // Verify Student Roll Number
  const handleVerifyRoll = async () => {
    if (!studentRollNo.trim()) {
      setErrorMessage('Please enter Register Number first!');
      return;
    }

    setErrorMessage('');
    setVerifying(true);

    try {
      const res = await axios.get(`https://hostelportal-backend-7buv.onrender.com/api/students/verify/${studentRollNo.trim()}`);
      setVerifiedStudentName(res.data);
      setIsRollVerified(true);
    } catch (err) {
      try {
        const allRes = await axios.get('https://hostelportal-backend-7buv.onrender.com/api/students');
        const found = allRes.data.find(s => s.rollNo.equalsIgnoreCase ? s.rollNo.equalsIgnoreCase(studentRollNo.trim()) : s.rollNo.toLowerCase() === studentRollNo.trim().toLowerCase());
        if (found) {
          setVerifiedStudentName(found.name);
          setIsRollVerified(true);
        } else {
          setErrorMessage('Student not found! Please check Register Number.');
          setIsRollVerified(false);
        }
      } catch (e) {
        setErrorMessage('Student not found with this Register Number!');
        setIsRollVerified(false);
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (portalMode === 'MAIN' && role === 'STUDENT' && !isRollVerified) {
      handleVerifyRoll();
      return;
    }

    setLoading(true);

    try {
      if (portalMode === 'MAIN') {
        if (role === 'STUDENT') {
          const response = await axios.post('https://hostelportal-backend-7buv.onrender.com/api/students/login', {
            rollNo: studentRollNo.trim(),
            dob: studentDob.trim()
          });
          localStorage.setItem('user', JSON.stringify(response.data));
          localStorage.setItem('role', 'STUDENT');

          setStudentRollNo('');
          setStudentDob('');
          setIsRollVerified(false);
          navigate('/student-dashboard');
        } else {
          const response = await axios.post('https://hostelportal-backend-7buv.onrender.com/api/admin/login', {
            adminId: adminId.trim(),
            password: adminPassword
          });
          localStorage.setItem('user', JSON.stringify(response.data));
          localStorage.setItem('role', 'ADMIN');

          setAdminId('');
          setAdminPassword('');
          navigate('/admin-dashboard');
        }
      } else {
        const isValidLh = role === 'GIRLS_HOSTEL' && wardenPassword === 'warden123Lh';
        const isValidBh = role === 'BOYS_HOSTEL' && wardenPassword === 'warden321Bh';

        if (isValidLh || isValidBh) {
          const wardenData = {
            id: role === 'GIRLS_HOSTEL' ? 101 : 102,
            wardenId: wardenUsername,
            name: role === 'GIRLS_HOSTEL' ? 'Girls Hostel Warden' : 'Boys Hostel Warden',
            hostelType: role === 'GIRLS_HOSTEL' ? 'LADIES_HOSTEL' : 'BOYS_HOSTEL'
          };
          localStorage.setItem('user', JSON.stringify(wardenData));
          localStorage.setItem('role', 'WARDEN');
          navigate('/warden-dashboard');
        } else {
          setErrorMessage('Invalid Warden ID or Access Code!');
        }
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setErrorMessage(typeof err.response.data === 'string' ? err.response.data : 'Invalid credentials');
      } else {
        setErrorMessage('Cannot connect to backend. Please ensure Spring Boot is running on port 8080!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      
      {/* Horizontal Split Layout */}
      <div className="split-showcase-container">
        
        {/* LEFT PANEL: Soft Blue Note Box */}
        <aside className="custom-exact-note-box soft-blue-box">
          <div className="exact-note-header">
            <span className="exact-info-icon-wrap">
              <Info size={17} strokeWidth={2.5} />
            </span>
            <span className="exact-note-title">NOTE</span>
          </div>

          {/* Clean line directly under NOTE header */}
          <hr className="exact-note-header-line" />

          <p className="exact-note-text">
            Welcome! This College Hostel Complaint Portal is a personal project created to showcase my skills in full-stack web development. It demonstrates how a real-world college hostel portal could function, including student login, complaint management, and hostel administration.
          </p>

          <div className="exact-note-prompt-group">
            <div className="prompt-heading">Want to explore the portal?</div>
            <div className="prompt-subtext">Use the demo credentials below to log in and experience the application.</div>
          </div>

          <hr className="exact-note-divider" />

          <div className="exact-creds-block">
            <div className="exact-creds-title">Demo Login Credentials</div>

            {/* Single Line Format */}
            <div className="exact-cred-single-line">
              <span className="exact-cred-label">Register Number & DOB :</span>
              <div className="exact-badge-pair">
                <span className="exact-cred-badge">23CSE041</span>
                <span className="exact-ampersand">&</span>
                <span className="exact-cred-badge">23.03.2005</span>
              </div>
            </div>
          </div>

          <div className="exact-note-footer">
            <strong>Important :</strong> This is a demonstration project built to showcase my skills and is not affiliated with any specific college.
          </div>
        </aside>

        {/* RIGHT PANEL: Main Login Card */}
        <div className={`login-card ${portalMode === 'WARDEN' ? 'warden-mode' : ''}`}>
          
          {/* Left Side Decorative Panel */}
          <div className="login-left">
            <div className="diagonal-accent"></div>

            {/* Role Tabs */}
            <div className="role-tabs">
              <div className={`tab-glider ${
                (role === 'ADMIN' || role === 'BOYS_HOSTEL') ? 'slide-admin' : 'slide-student'
              }`}></div>

              {portalMode === 'MAIN' ? (
                <>
                  <button
                    type="button"
                    className={`role-tab-btn ${role === 'STUDENT' ? 'active' : ''}`}
                    onClick={() => { 
                      setRole('STUDENT'); 
                      setErrorMessage(''); 
                      setStudentRollNo(''); 
                      setStudentDob(''); 
                      setIsRollVerified(false);
                      setVerifiedStudentName('');
                    }}
                  >
                    <User size={18} />
                    <span>STUDENT</span>
                  </button>
                  <button
                    type="button"
                    className={`role-tab-btn ${role === 'ADMIN' ? 'active' : ''}`}
                    onClick={() => { 
                      setRole('ADMIN'); 
                      setErrorMessage(''); 
                      setAdminId(''); 
                      setAdminPassword(''); 
                    }}
                  >
                    <ShieldCheck size={18} />
                    <span>ADMIN</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className={`role-tab-btn ${role === 'GIRLS_HOSTEL' ? 'active' : ''}`}
                    onClick={() => { 
                      setRole('GIRLS_HOSTEL'); 
                      setErrorMessage(''); 
                      setWardenUsername(''); 
                      setWardenPassword(''); 
                    }}
                  >
                    <Building2 size={18} />
                    <span>GIRLS HOSTEL</span>
                  </button>
                  <button
                    type="button"
                    className={`role-tab-btn ${role === 'BOYS_HOSTEL' ? 'active' : ''}`}
                    onClick={() => { 
                      setRole('BOYS_HOSTEL'); 
                      setErrorMessage(''); 
                      setWardenUsername(''); 
                      setWardenPassword(''); 
                    }}
                  >
                    <Building2 size={18} />
                    <span>BOYS HOSTEL</span>
                  </button>
                </>
              )}
            </div>

            <div className="portal-left-footer">
              <span>{portalMode === 'MAIN' ? 'Hostel Grievance Portal' : 'Warden Operations Desk'}</span>
            </div>
          </div>

          {/* Right Side Form Panel */}
          <div className="login-right">
            
            <div className="avatar-badge">
              {portalMode === 'MAIN' ? (
                role === 'STUDENT' ? <User size={44} strokeWidth={1.8} /> : <ShieldCheck size={44} strokeWidth={1.8} />
              ) : (
                <Building2 size={44} strokeWidth={1.8} />
              )}
            </div>

            <h1 className="title-text">
              {portalMode === 'MAIN' ? (
                role === 'STUDENT' ? 'STUDENT LOGIN' : 'ADMIN LOGIN'
              ) : (
                role === 'GIRLS_HOSTEL' ? 'GIRLS HOSTEL WARDEN' : 'BOYS HOSTEL WARDEN'
              )}
            </h1>
            <p className="subtitle-text">
              {portalMode === 'MAIN' ? (
                role === 'STUDENT' ? 'Enter Register No & Date of Birth' : 'Enter Admin ID & Security Password'
              ) : (
                'Enter Warden Credentials to Manage Facilities'
              )}
            </p>

            {errorMessage && (
              <div className="error-box">
                {errorMessage}
              </div>
            )}

            <form className="form-container" onSubmit={handleLogin}>
              {portalMode === 'MAIN' ? (
                role === 'STUDENT' ? (
                  <>
                    <div className="input-row">
                      <span className="input-icon"><Hash size={18} /></span>
                      <input
                        type="text"
                        required
                        placeholder="Register Number"
                        value={studentRollNo}
                        onChange={(e) => {
                          setStudentRollNo(e.target.value);
                          if (isRollVerified) {
                            setIsRollVerified(false);
                            setVerifiedStudentName('');
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !isRollVerified) {
                            e.preventDefault();
                            handleVerifyRoll();
                          }
                        }}
                      />
                    </div>

                    {isRollVerified && (
                      <div className="accordion-expand-box">
                        <div className="verified-student-pill">
                          <CheckCircle2 size={15} color="#059669" />
                          <span>Student: <strong>{verifiedStudentName}</strong></span>
                        </div>

                        <div className="input-row">
                          <span className="input-icon"><Calendar size={18} /></span>
                          <input
                            type="text"
                            required
                            autoFocus
                            placeholder="Date of Birth (DD.MM.YYYY)"
                            value={studentDob}
                            onChange={(e) => setStudentDob(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="input-row">
                      <span className="input-icon"><User size={18} /></span>
                      <input
                        type="text"
                        required
                        placeholder="Admin Id"
                        value={adminId}
                        onChange={(e) => setAdminId(e.target.value)}
                      />
                    </div>

                    <div className="input-row">
                      <span className="input-icon"><Lock size={18} /></span>
                      <input
                        type="password"
                        required
                        placeholder="Password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                      />
                    </div>
                  </>
                )
              ) : (
                <>
                  <div className="input-row">
                    <span className="input-icon"><User size={18} /></span>
                    <input
                      type="text"
                      required
                      placeholder="Warden Id"
                      value={wardenUsername}
                      onChange={(e) => setWardenUsername(e.target.value)}
                    />
                  </div>

                  <div className="input-row">
                    <span className="input-icon"><Lock size={18} /></span>
                    <input
                      type="password"
                      required
                      placeholder="Warden Access Code"
                      value={wardenPassword}
                      onChange={(e) => setWardenPassword(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="action-row action-row-right">
                {portalMode === 'MAIN' && role === 'STUDENT' && !isRollVerified ? (
                  <button 
                    type="button" 
                    className="login-btn"
                    onClick={handleVerifyRoll}
                    disabled={verifying}
                  >
                    {verifying ? 'CHECKING...' : 'NEXT →'}
                  </button>
                ) : (
                  <button type="submit" className="login-btn" disabled={loading}>
                    {loading ? 'CHECKING...' : 'LOGIN'}
                  </button>
                )}
              </div>
            </form>

            <div className="footer-strip">
              <span>© 2026 Syed Ammal Engg College</span>
              {portalMode === 'MAIN' ? (
                <span className="helper-link highlight-support" onClick={handleSwitchToWarden}>
                  Warden Desk →
                </span>
              ) : (
                <span className="helper-link highlight-support" onClick={handleSwitchToMain}>
                  ← Student / Admin Login
                </span>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}