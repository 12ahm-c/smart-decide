// src/pages/AdminCreateOrg.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminCraeteOrg.css';


const AdminCreateOrg = ({ token }) => {
  const [orgName, setOrgName] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [memberCodes, setMemberCodes] = useState(Array(10).fill('')); // 10 أكواد اختيارية
  const navigate = useNavigate();

  const handleMemberCodeChange = (index, value) => {
    const newCodes = [...memberCodes];
    newCodes[index] = value;
    setMemberCodes(newCodes);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    // فقط الأكواد المملوءة
    const filledMemberCodes = memberCodes.filter(code => code.trim() !== '');
    try {
      const response = await fetch('http://localhost:5001/api/create-organization', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          orgName, 
          adminCode, 
          memberCodes: filledMemberCodes 
        })
      });
      const data = await response.json();
      if (response.ok) {
        alert(`Organization created! Your code: ${data.code}`);
        navigate('/dashboard');
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error creating organization.');
    }
  };

  return (
    <div className="admin-create-org-container">
      <h2>Create New Organization</h2>
      <form onSubmit={handleCreate}>
        <input 
          type="text"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          placeholder="Organization Name"
          required
        />
        <input 
          type="text"
          value={adminCode}
          onChange={(e) => setAdminCode(e.target.value)}
          placeholder="Admin Code"
          required
        />
        <h4>Member Codes (optional, up to 10)</h4>
        {memberCodes.map((code, index) => (
          <input 
            key={index}
            type="text"
            value={code}
            onChange={(e) => handleMemberCodeChange(index, e.target.value)}
            placeholder={`Member Code ${index + 1}`}
          />
        ))}
        <button type="submit">Create Organization</button>
      </form>
    </div>
  );
};

export default AdminCreateOrg;