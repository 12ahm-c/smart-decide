import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import './SplashScreen.css';

const SplashScreen = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading process
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsLoaded(true);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    return () => clearInterval(progressInterval);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => {
        navigate('/Home');
      }, 1000); // Wait 1 second after loading is complete

      return () => clearTimeout(timer);
    }
  }, [isLoaded, navigate]);

  return (
    <div className="splash-container">
      <div className="splash-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="splash-content">
        <div className="logo-wrapper">
          <div className="logo-ring"></div>
          <img src={logo} alt="SmartDecide Logo" className="splash-logo" />
        </div>

        <h1 className="splash-title">SmartDecide</h1>
        <p className="splash-subtitle">Make your decisions smart and easily</p>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}>
            <div className="progress-glow"></div>
          </div>
          <span className="progress-text">{progress}%</span>
        </div>

        {/* Animated Loading Dots */}
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
