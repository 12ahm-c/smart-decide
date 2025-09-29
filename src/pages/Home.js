import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="floating-elements">
        <div className="floating-element"></div>
        <div className="floating-element"></div>
        <div className="floating-element"></div>
        <div className="floating-element"></div>
      </div>
      
      <div className="intro-section">
        <h1>Welcome to <span className="highlight">SmartDecide</span></h1>
        <p>
          A smart application that helps you make personal and family decisions in an easy and secure way.
          You can create an account to log in and use all the features of the application.
        </p>
      </div>

      <div className="cta-buttons">
        <Link to="/login" className="btn btn-primary">Login</Link>
        <Link to="/signup" className="btn btn-secondary">Create Account</Link>
      </div>
    </div>
  );
};

export default Home;
