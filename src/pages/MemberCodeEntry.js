// src/pages/MemberCodeEntry.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MemberCodeEntry.css';


const MemberCodeEntry = ({ token }) => {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/api/join-organization', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code })
      });

      const data = await response.json();

      if (response.ok) {
        alert('تم الدخول بنجاح!');

        // التوجيه حسب الدور
        if (data.role === 'admin') {
          navigate('/admin-dashboard'); // لوحة المشرف
        } else {
          navigate('/dashboard'); // لوحة العضو العادي
        }

      } else {
        // رسالة الخطأ من السيرفر
        alert(data.message || 'حدث خطأ أثناء الدخول');
      }

    } catch (err) {
      console.error('Error connecting to server:', err);
      alert('خطأ في الاتصال بالسيرفر.');
    }
  };

  return (
    <div className="member-code-container">
      <h2>أدخل كود الجمعية</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="كود الجمعية"
          required
        />
        <button type="submit">انضم</button>
      </form>
    </div>
  );
};

export default MemberCodeEntry;