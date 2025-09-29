import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css'; // You can use the same Home.css or make minor modifications

const domains = [
  { id: 'family-budget', name: 'Monthly Family Budget' },
  { id: 'family-food', name: 'Weekly Family Meals' },
  { id: 'home-organization', name: 'Home Organization and Task Distribution' },
  { id: 'education-planning', name: 'Education Planning and Lessons' },
  { id: 'family-health', name: 'General Health and Check-up Follow-ups' },
  { id: 'leisure-activities', name: 'Leisure Activities and Trips' },
  { id: 'community-engagement', name: 'Communication and Engagement with Neighbors' },
  { id: 'work-family-balance', name: 'Balancing Work and Family Time' },
  { id: 'volunteering', name: 'Small Volunteering Participation' },
  { id: 'celebrations', name: 'Managing Celebrations and Occasions' },
  { id: 'transportation', name: 'Family Transportation and Commuting' },
  { id: 'shopping', name: 'Weekly Household Shopping' },
  { id: 'digital-entertainment', name: 'Digital Entertainment Management' },
  { id: 'children-projects', name: 'Children\'s Projects and Hobbies' },
  { id: 'family-relationships', name: 'Managing Family Relationships' },
  { id: 'long-term-finance', name: 'Long-term Financial Planning' },
  { id: 'family-travel', name: 'Family Travel Decisions' },
  { id: 'elderly-care', name: 'Elderly Care in the Family' },
  { id: 'energy-management', name: 'Energy and Home Utilities Management' },
  { id: 'emergency-preparedness', name: 'Emergency Preparedness and Safety Plans' },
  { id: 'health-nutrition', name: 'Family Health Nutrition' },
  { id: 'home-cleaning', name: 'Home Cleaning Scheduling and Organization' },
  { id: 'weekly-schedule', name: 'Coordinating the Family Weekly Schedule' },
  { id: 'conflict-resolution', name: 'Family Conflict Resolution' },
  { id: 'special-occasions', name: 'Preparing for Special Occasions' }
];

const Dashboard = ({ token }) => {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);

useEffect(() => {
  if (token) {
    // جلب بيانات المستخدم
    fetch('http://localhost:5000/api/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setUser(data.user))
    .catch(err => console.error('Error fetching user data:', err));

    // جلب قرارات المستخدم
    fetch('http://localhost:5001/api/decisions', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setHistory(data.decisions))
    .catch(err => console.error('Error fetching user decisions:', err));
  }
}, [token]);

  return (
    <div className="dashboard-container">
      {user && (
        <div className="welcome-user">
          <h2>Welcome, {user.fullName}!</h2>
          {user.avatar && <img src={`http://localhost:5000${user.avatar}`} alt="Avatar" className="avatar" />}
        </div>
      )}

      <h1>Choose the domain you want to make a decision in</h1>
      <div className="domains-grid">
        {domains.map(domain => (
          <Link key={domain.id} to={`/form/${domain.id}`} className="domain-card">
            {domain.name}
          </Link>
        ))}
      </div>

{/* Decision History */}
<div className="history-section">
  <h2>Previous Decision History</h2>
  {history.length === 0 ? (
    <p className="no-history">No decisions have been made yet.</p>
  ) : (
    <div className="history-list">
      {history.map(item => {
        // محاولة parse formData بأمان
        let parsedFormData = {};
        try {
          parsedFormData = item.formData ? JSON.parse(item.formData) : {};
        } catch (err) {
          console.error('Failed to parse formData for item id', item.id, err);
        }

        // معالجة التاريخ بشكل آمن
        const createdDate = item.createdAt ? new Date(item.createdAt) : null;

        return (
<Link
  key={item.id}
  to={`/result/${item.id}`}
  state={{
    domainName: item.domain,
    // حاول التحويل إلى JSON، وإذا فشل أعطه نص فارغ أو النص نفسه
    formData: (() => {
      try {
        return JSON.parse(item.input);
      } catch (e) {
        // إذا لم يكن JSON صالح، اجعل النص كـ object مع مفتاح واحد
        return { rawInput: item.input || "" };
      }
    })(),
    aiResult: item.aiResult,
    blockchainId: item.fileId
  }}
  className="history-card"
>
  <h3>{item.domain || 'Unnamed Decision'}</h3>
  <p>{item.aiResult?.substring(0, 50) || 'Decision summary...'}</p>
  <span className="history-date">{new Date(item.timestamp).toLocaleString()}</span>
</Link>
        );
      })}
    </div>
  )}
</div>
    </div>
  );
};

export default Dashboard;
