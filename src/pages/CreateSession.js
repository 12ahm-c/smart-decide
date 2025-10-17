// CreateSession.js
// This page allows a logged-in user to create a new session in SmartDecide.
// User can specify decision title, optional description, duration, and analysis method.
// After creation, a session code and join link are generated.

import React, { useState } from 'react';
import './CreateSession.css';
const CreateSession = ({ token }) => {
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(1); // in hours
  const [analysisMethod, setAnalysisMethod] = useState('Majority');
  const [sessionCode, setSessionCode] = useState(null);
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e && e.preventDefault();

    // Simple validation
    if (!title) return alert('Please enter a decision title.');
    if (!duration || duration <= 0) return alert('Duration must be a positive number.');

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
          durationHours: Number(duration),
          analysisMethod,
        }),
      });

      // Parse response safely
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch (e) { data = { message: text }; }

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

  return (
    <div className="create-session-container">
      <h2>Create New Session</h2>

      <form onSubmit={handleCreate}>
        <div>
          <label>Decision Title:</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Decision Description (Optional):</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label>Voting Duration (hours):</label>
          <input
            type="number"
            min="1"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Analysis Method:</label>
          <select
            value={analysisMethod}
            onChange={(e) => setAnalysisMethod(e.target.value)}
          >
            <option value="Majority">Majority</option>
            <option value="Preference">Preference</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Session'}
        </button>
      </form>

      {sessionCode && (
        <div className="session-info" style={{ marginTop: 16 }}>
          <h3>Session Created!</h3>
          <p>Session Code: <strong>{sessionCode}</strong></p>
        </div>
      )}
    </div>
  );
};

export default CreateSession;