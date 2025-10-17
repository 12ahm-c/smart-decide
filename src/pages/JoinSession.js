// JoinSession.js
// This page allows a logged-in user to join an existing session by entering a session code.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './JoinSession.css';
const JoinSession = ({ token }) => {
  const [sessionCode, setSessionCode] = useState(''); // store entered session code
  const [message, setMessage] = useState(''); // store error/success messages
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!sessionCode) return alert("Please enter a session code.");

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
        // Redirect to the session dashboard
        navigate(`/session/${sessionCode}`);
      } else {
        setMessage(data.message || "Session code not found or expired.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server connection error.");
    }
  };

  return (
    <div className="join-session-container">
      <h2>Join a Session</h2>

      <div>
        <label>Session Code:</label>
        <input
          value={sessionCode}
          onChange={(e) => setSessionCode(e.target.value)}
          placeholder="Enter session code"
        />
      </div>

      <button onClick={handleJoin}>Join</button>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default JoinSession;