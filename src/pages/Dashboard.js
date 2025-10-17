// Dashboard.js
// This page is the main dashboard after login.
// It greets the user and provides options to either create a new session or join an existing one.

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = ({ token }) => {
  const [user, setUser] = useState(null); // store user data
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if token is missing
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch current user data from server
    fetch('http://localhost:5001/api/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setUser(data.user))
      .catch(err => console.error('Error fetching user data:', err));
  }, [token, navigate]);

  return (
    <div className="dashboard-container">


      {/* Options to create or join a session */}
      <div className="options-container">
        <Link to="/create-session" className="dashboard-button create-session">
          🧩 Create New Session
        </Link>

        <Link to="/join-session" className="dashboard-button join-session">
          🤝 Join Session
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;