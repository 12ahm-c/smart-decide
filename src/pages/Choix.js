// src/pages/Choix.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Choix.css';

const Choix = () => {
  const navigate = useNavigate();

  return (
    <div className="choix-container">
      <h1>Choose your path</h1>
      <div className="choix-buttons">
        <button onClick={() => navigate('/member-code-entry')}>Join Existing Organization</button>
        <button onClick={() => navigate('/admin-create-org')}>Create New Organization</button>
      </div>
    </div>
  );
};

export default Choix;
