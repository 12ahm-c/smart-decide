// SignUp.js
// This page allows users to create a new account in SmartDecide.
// Users can provide their full name, email, password, and optionally upload an avatar image.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';

const Signup = () => {
  // State to store form input values
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });

  // State to store uploaded avatar
  const [avatar, setAvatar] = useState(null);

  const navigate = useNavigate();

  // Update form data when user types
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Store selected avatar file
  const handleFileChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('email', formData.email);
      data.append('password', formData.password);
      if (avatar) data.append('avatar', avatar); // optional

      const response = await fetch('http://localhost:5001/api/signup', {
        method: 'POST',
        body: data, // FormData automatically sets Content-Type
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message); // show success message
        navigate('/login'); // redirect to login page
      } else {
        alert(result.message); // show error message from server
      }
    } catch (error) {
      console.error(error);
      alert('Unable to connect to the server.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Create New Account</h2>
        <form onSubmit={handleSubmit}>
          {/* Full Name input */}
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />

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

          {/* Optional Avatar upload */}
          <input type="file" onChange={handleFileChange} />

          {/* Submit button */}
          <button type="submit">Create Account</button>
        </form>
      </div>
    </div>
  );
};

export default Signup;