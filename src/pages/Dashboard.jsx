import { BarChart2, CheckCircle, Clipboard, Clock, LogOut, Menu, Plus, Search, Sparkles, Users, X, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import './Dashboard.css';

const Dashboard = ({ token, setToken }) => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ active: 0, completed: 0, participants: 0 });
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [userRes, statsRes, sessionsRes] = await Promise.all([
          fetch('http://localhost:5001/api/me', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:5001/api/dashboard/stats', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:5001/api/sessions', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (userRes.ok) setUser((await userRes.json()).user);
        if (statsRes.ok) {
          const d = await statsRes.json();
          setStats({
            active: d.activeSessions || 0,
            completed: d.completedSessions || 0,
            participants: d.totalParticipants || 0
          });
        }
        if (sessionsRes.ok) setSessions((await sessionsRes.json()).sessions || []);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      {/* Navigation */}
      <nav className="dashboard-nav">
        <div className="nav-content">
          <Link to="/" className="logo-section">
            <img src={logo} alt="SmartDecide" className="logo-icon" />
            <span className="logo-text">SmartDecide</span>
            <span className="hedera-badge">
              <Zap size={14} />
              Hedera
            </span>
          </Link>

          <div className="search-container desktop-search">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="nav-actions">
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className={`user-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.fullName}&background=ff6b35&color=fff`}
                alt={user?.fullName || 'User'}
                className="user-avatar"
              />
              <div className="dropdown">
                <div className="user-details">
                  <strong>{user?.fullName || 'Loading...'}</strong>
                  <span>{user?.email || ''}</span>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-text">
            <h1 className="greeting">
              {getGreeting()}, {user?.fullName?.split(' ')[0] || 'User'}!
            </h1>
            <p className="subtitle">Here's your decision-making command center.</p>
          </div>
          <div className="header-actions">
            <button
              className="action-btn secondary"
              onClick={() => navigate('/join-session')}
            >
              <Users size={18} />
              <span>Join Session</span>
            </button>
            <button
              className="action-btn primary"
              onClick={() => navigate('/create-session')}
            >
              <Plus size={18} />
              <span>Create Session</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatCard
            icon={<Clock size={28} />}
            value={stats.active}
            label="Active Sessions"
            color="#60a5fa"
            loading={loading}
          />
          <StatCard
            icon={<CheckCircle size={28} />}
            value={stats.completed}
            label="Completed Sessions"
            color="#10b981"
            loading={loading}
          />
          <StatCard
            icon={<Users size={28} />}
            value={stats.participants}
            label="Total Participants"
            color="#a78bfa"
            loading={loading}
          />
        </div>

        {/* Sessions Section */}
        <div className="sessions-section">
          <div className="section-header">
            <h2 className="section-title">Recent Sessions</h2>
            <div className="mobile-search">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="sessions-list">
            {loading ? (
              <LoadingState />
            ) : filteredSessions.length > 0 ? (
              filteredSessions.map(session => (
                <SessionCard
                  key={session.id}
                  session={session}
                  copiedCode={copiedCode}
                  onCopyCode={handleCopyCode}
                  onViewResults={() => navigate(`/session/${session.id}/results`)}
                />
              ))
            ) : (
              <EmptyState onCreate={() => navigate('/create-session')} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// StatCard Component
const StatCard = ({ icon, value, label, color, loading }) => (
  <div className="stat-card">
    <div
      className="stat-icon"
      style={{
        background: `linear-gradient(135deg, ${color}20, ${color}10)`,
        color: color
      }}
    >
      {icon}
    </div>
    <div className="stat-info">
      {loading ? (
        <span className="stat-value loading-shimmer"></span>
      ) : (
        <span className="stat-value">{value}</span>
      )}
      <span className="stat-label">{label}</span>
    </div>
  </div>
);

// SessionCard Component
const SessionCard = ({ session, copiedCode, onCopyCode, onViewResults }) => (
  <div className="session-card">
    <div className="session-top">
      <h3 className="session-title">{session.title}</h3>
      <span className={`status-badge ${session.status?.toLowerCase()}`}>
        {session.status}
      </span>
    </div>

    {session.status === 'Active' && session.sessionCode && (
      <div className="code-section">
        <span className="code-label">Session Code</span>
        <div className="code-display">
          <code>{session.sessionCode}</code>
          <button
            onClick={() => onCopyCode(session.sessionCode)}
            className="copy-btn"
            aria-label="Copy session code"
          >
            {copiedCode === session.sessionCode ?
              <CheckCircle size={16} /> :
              <Clipboard size={16} />
            }
          </button>
        </div>
      </div>
    )}

    <p className="session-desc">{session.description}</p>

    <div className="session-footer">
      <div className="participants-count">
        <Users size={16} />
        <span>{session.participants} Participants</span>
      </div>

      {session.status === 'Active' && session.progress != null && (
        <div className="progress-wrapper">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${session.progress}%` }}
            ></div>
          </div>
          <span className="progress-text">{session.progress}%</span>
        </div>
      )}

      {session.status === 'Completed' && (
        <button
          className="results-btn"
          onClick={onViewResults}
        >
          <span>View Results</span>
          <BarChart2 size={16} />
        </button>
      )}
    </div>
  </div>
);

// LoadingState Component
const LoadingState = () => (
  <div className="loading-state">
    <div className="spinner"></div>
    <p>Loading sessions...</p>
  </div>
);

// EmptyState Component
const EmptyState = () => (
  <div className="empty-state">
    <div className="empty-icon-wrapper">
      <Sparkles size={56} />
    </div>
    <h3>No sessions yet!</h3>
    <p>Create your first session to get started with collaborative decision-making.</p>
  </div>
);

export default Dashboard;
