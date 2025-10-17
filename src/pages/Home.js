// Home.js
// Landing page for SmartDecide
// I designed this page to welcome users and guide them to login or sign up.

import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">

      {/* Decorative floating elements for a dynamic look */}
      <div className="floating-elements">
        <div className="floating-element"></div>
        <div className="floating-element"></div>
        <div className="floating-element"></div>
        <div className="floating-element"></div>
      </div>

      {/* Intro text section */}
      <div className="intro-section">
        <h1>
          Welcome to <span className="highlight">SmartDecide</span>
        </h1>
        <p>
          SmartDecide helps you make <strong>personal and family decisions</strong> easily and safely.
          Create an account to access all features and start making decisions smarter.
        </p>
      </div>

      {/* Main buttons */}
      <div className="cta-buttons">
        {/* Button to navigate to login */}
        <Link to="/login" className="btn btn-primary">
          Login
        </Link>

        {/* Button to navigate to signup */}
        <Link to="/signup" className="btn btn-secondary">
          Create Account
        </Link>
      </div>

    </div>
  );
};

export default Home;