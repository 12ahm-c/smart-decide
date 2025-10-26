import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './JoinSession.css';

const JoinSession = ({ token }) => {
  const [sessionCode, setSessionCode] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!sessionCode.trim()) {
      setMessage("Please enter a session code.");
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(`http://localhost:5001/api/sessions/${sessionCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        navigate(`/session/${sessionCode}`);
      } else {
        setMessage(data.message || "Session code not found or expired.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server connection error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleJoin();
    }
  };

  return (
    <div className="join-session-page">
      <Link to="/dashboard" className="join-back-link">
        <ArrowLeft size={18} />
        <span>Back to Dashboard</span>
      </Link>

      <div className="join-session-wrapper">
        <div className="join-icon-box">
          <div className="join-emoji-icon">🤝</div>
        </div>

        <h2 className="join-page-title">Join a Session</h2>
        <p className="join-page-subtitle">Enter the session code to collaborate with your team</p>

        <div className="join-form-field">
          <label className="join-input-label">Session Code</label>
          <input
            className="join-code-input"
            value={sessionCode}
            onChange={(e) => setSessionCode(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter session code"
            disabled={isLoading}
          />
        </div>

        <button
          className="join-submit-btn"
          onClick={handleJoin}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="join-loading-spinner"></div>
              Joining...
            </>
          ) : (
            'Join Session'
          )}
        </button>

        {message && (
          <p className={`join-status-message ${message.includes('success') ? 'success' : ''}`}>
            {message}
          </p>
        )}

        <button
          className="join-return-btn"
          onClick={() => navigate('/dashboard')}
          disabled={isLoading}
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default JoinSession;
