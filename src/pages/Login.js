// Login.js
// This page allows users to log in to the SmartDecide application.
// Users enter their email and password, and upon successful login, they are redirected to the dashboard.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

const Login = ({ setToken }) => {
  // State to store email and password input
  const [formData, setFormData] = useState({ email: '', password: '' });

  // React Router hook to navigate programmatically
  const navigate = useNavigate();

  // Update state when user types in email or password
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page refresh
    try {
      const response = await fetch('http://localhost:5001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), // Send email and password
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token); // Save token in app state
        navigate('/dashboard'); // Redirect to dashboard after login
      } else {
        alert(data.message); // Show server error message
      }
    } catch (error) {
      console.error(error);
      alert('Unable to connect to the server.'); // Network or server error
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          {/* Email input */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          {/* Password input */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {/* Submit button */}
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;