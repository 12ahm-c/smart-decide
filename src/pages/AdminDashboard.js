// src/pages/AdminDashboard.js
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      {/* الشريط الجانبي */}
      <aside className="sidebar">
        <h2 className="logo">SmartDecide</h2>
        <nav>
          <ul>
            <li>
              <NavLink to="/admin" end className={({ isActive }) => isActive ? 'active' : ''}>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/members" className={({ isActive }) => isActive ? 'active' : ''}>
                Manage Members
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/decisions" className={({ isActive }) => isActive ? 'active' : ''}>
                Decisions
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/reports" className={({ isActive }) => isActive ? 'active' : ''}>
                Reports
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/settings" className={({ isActive }) => isActive ? 'active' : ''}>
                Settings
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="main-content">
        <Outlet /> {/* هنا ستظهر الصفحات الفرعية */}
      </main>
    </div>
  );
};

export default AdminDashboard;