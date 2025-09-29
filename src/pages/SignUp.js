import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';

const Signup = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [avatar, setAvatar] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setAvatar(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('email', formData.email);
      data.append('password', formData.password);
      if (avatar) data.append('avatar', avatar);

      const response = await fetch('http://localhost:5001/api/signup', {
        method: 'POST',
        body: data, // No Content-Type here
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message);
        navigate('/login');
      } else {
        alert(result.message);
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
          <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          <input type="file" onChange={handleFileChange} />
          <button type="submit">Create Account</button>
        </form>
      </div>
    </div>
  );
};

export default Signup;