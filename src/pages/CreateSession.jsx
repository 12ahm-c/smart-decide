import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Copy,
  FileText,
  Plus,
  Settings,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CreateSession.css';

const CreateSession = ({ token }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [analysisMethod, setAnalysisMethod] = useState('Majority');
  const [sessionCode, setSessionCode] = useState(null);
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const parseDurationToSeconds = (input) => {
    if (!input) return 0;

    if (input.includes(':')) {
      const parts = input.split(':').map(Number);
      if (parts.length === 2) {
        const [h, m] = parts;
        return h * 3600 + m * 60;
      } else if (parts.length === 3) {
        const [h, m, s] = parts;
        return h * 3600 + m * 60 + s;
      }
    }

    const hours = parseFloat(input);
    if (!isNaN(hours)) return hours * 3600;

    return 0;
  };

  const handleCreate = async (e) => {
    e && e.preventDefault();

    if (!title.trim()) return alert('Please enter a decision title.');

    const totalSeconds = parseDurationToSeconds(duration);

    if (totalSeconds <= 0)
      return alert('Duration must be greater than 0.');

    setLoading(true);

    try {
      const res = await fetch('http://localhost:5001/api/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title,
          description,
          durationSeconds: totalSeconds,
          analysisMethod,
        }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { message: text };
      }

      if (!res.ok) {
        alert(data.message || 'Error while creating session.');
        setLoading(false);
        return;
      }

      setSessionCode(data.sessionCode);
      setLink(`${window.location.origin}/join/${data.sessionCode}`);
      alert('Session created successfully — share the code with members!');
    } catch (err) {
      console.error('Create session error:', err);
      alert('Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    alert('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="create-session-container">
      <div className="grid-pattern"></div>
      <div className="gradient-overlay"></div>

      <div className="floating-elements">
        <div className="floating-element float-1 glow-orange"></div>
        <div className="floating-element float-2 glow-orange-light"></div>
        <div className="floating-element float-3 glow-orange-dark"></div>
        <div className="floating-element-small float-4"></div>
      </div>

      <div className="particles">
        {[...Array(15)].map((_, i) => (
          <div key={i} className={`particle particle-${i % 5}`}></div>
        ))}
      </div>

      {/* Header */}
      <div className="session-header">
        <Link to="/dashboard" className="session-back-button">
          <ArrowLeft size={18} />
          <span className="back-text">Back</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="content-wrapper">
        {!sessionCode ? (
          // Create Form
          <div className="session-form-card">
            <div className="card-glow"></div>

            <div className="session-logo-container">
              <div className="logo-glow"></div>
              <div className="session-logo">
                <Plus size={40} color="white" strokeWidth={2.5} />
              </div>
            </div>

            <div className="session-badge">
              <Sparkles size={14} color="#ff6b35" />
              <span className="session-badge-text">New Session</span>
            </div>

            <h2 className="session-title">Create New Session</h2>
            <p className="session-subtitle">
              Set up a new decision-making session and invite your team to collaborate
            </p>

            <form onSubmit={handleCreate} className="session-form-container">
              {/* Title Input */}
              <div className="session-input-group">
                <label className="session-label">Decision Title</label>
                <div className={`session-input-wrapper ${focusedField === 'title' ? 'focused' : ''}`}>
                  <FileText
                    size={20}
                    className="session-input-icon"
                    color={focusedField === 'title' ? '#ff6b35' : '#94a3b8'}
                  />
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onFocus={() => setFocusedField('title')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="e.g., Choose new office location"
                    className="session-input"
                    required
                  />
                </div>
              </div>

              {/* Description Textarea */}
              <div className="session-input-group">
                <label className="session-label">Description (Optional)</label>
                <div className={`session-input-wrapper ${focusedField === 'description' ? 'focused' : ''}`}>
                  <FileText
                    size={20}
                    className="session-textarea-icon"
                    color={focusedField === 'description' ? '#ff6b35' : '#94a3b8'}
                  />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onFocus={() => setFocusedField('description')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Add context or details about this decision..."
                    className="session-textarea"
                    rows="4"
                  />
                </div>
              </div>

              {/* Duration and Method Row */}
              <div className="session-form-row">
                <div className="session-input-group">
                  <label className="session-label">Duration (hours)</label>
                  <div className={`session-input-wrapper ${focusedField === 'duration' ? 'focused' : ''}`}>
                    <Clock
                      size={20}
                      className="session-input-icon"
                      color={focusedField === 'duration' ? '#ff6b35' : '#94a3b8'}
                    />
                    <input
                      type="text"
                      value={duration}
                      placeholder="hh:mm:ss"
                      onChange={(e) => setDuration(e.target.value)}
                      onFocus={() => setFocusedField('duration')}
                      onBlur={() => setFocusedField(null)}
                      className="session-input"
                      required
                    />
                  </div>
                </div>

                <div className="session-input-group">
                  <label className="session-label">Analysis Method</label>
                  <div className={`session-input-wrapper ${focusedField === 'method' ? 'focused' : ''}`}>
                    <Settings
                      size={20}
                      className="session-input-icon"
                      color={focusedField === 'method' ? '#ff6b35' : '#94a3b8'}
                    />
                    <select
                      value={analysisMethod}
                      onChange={(e) => setAnalysisMethod(e.target.value)}
                      onFocus={() => setFocusedField('method')}
                      onBlur={() => setFocusedField(null)}
                      className="session-select"
                    >
                      <option value="Majority">Majority</option>
                      <option value="Preference">Preference</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="session-submit-button"
              >
                {loading ? (
                  <span className="button-content">
                    <div className="button-spinner"></div>
                    Creating...
                  </span>
                ) : (
                  <span className="button-content">
                    Create Session
                    <span className="button-arrow">→</span>
                  </span>
                )}
              </button>
            </form>
          </div>
        ) : (
          // Success Card
          <div className="session-success-card">
            <div className="card-glow"></div>

            <div className="success-icon-wrapper">
              <CheckCircle size={64} color="#10b981" strokeWidth={2.5} />
            </div>

            <h2 className="success-title">Session Created! 🎉</h2>
            <p className="success-subtitle">
              Share the session code or link below with your team members
            </p>

            <div className="code-section">
              <div className="code-label">Session Code</div>
              <div className="code-box">
                <span className="code-text">{sessionCode}</span>
                <button
                  onClick={() => copyToClipboard(sessionCode)}
                  className="copy-button"
                >
                  {copied ? <CheckCircle size={18} color="#10b981" /> : <Copy size={18} color="#ff6b35" />}
                </button>
              </div>
            </div>

            {link && (
              <div className="link-section">
                <div className="link-label">Join Link</div>
                <div className="link-box">
                  <span className="link-text">{link}</span>
                  <button
                    onClick={() => copyToClipboard(link)}
                    className="copy-button"
                  >
                    {copied ? <CheckCircle size={18} color="#10b981" /> : <Copy size={18} color="#ff6b35" />}
                  </button>
                </div>
              </div>
            )}

            <div className="details-grid">
              <div className="detail-card">
                <FileText size={20} color="#ff6b35" />
                <div className="detail-content">
                  <div className="detail-label">Title</div>
                  <div className="detail-value">{title}</div>
                </div>
              </div>

              <div className="detail-card">
                <Clock size={20} color="#ff6b35" />
                <div className="detail-content">
                  <div className="detail-label">Duration</div>
                  <div className="detail-value">{duration}</div>
                </div>
              </div>

              <div className="detail-card">
                <Settings size={20} color="#ff6b35" />
                <div className="detail-content">
                  <div className="detail-label">Method</div>
                  <div className="detail-value">{analysisMethod}</div>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button
                onClick={() => {
                  setSessionCode(null);
                  setLink('');
                  setTitle('');
                  setDescription('');
                  setDuration('');
                  setAnalysisMethod('Majority');
                }}
                className="secondary-action-button"
              >
                Create Another
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="primary-action-button"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateSession;
