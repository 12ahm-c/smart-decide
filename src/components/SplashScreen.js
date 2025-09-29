import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SplashScreen.css';
import logo from '../assets/logo.png';

const SplashScreen = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // محاكاة عملية التحميل
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
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoaded, navigate]);

  return (
    <div className="splash-container">
      <div className="splash-content">
        <img src={logo} alt="SmartDecide Logo" className="splash-logo" />
        <h1 className="splash-title">SmartDecide</h1>
        <p className="splash-subtitle">اتخذ قراراتك بذكاء وسهولة</p>
        
        {/* شريط التقدم */}
        <div className="progress-container">
          <div 
            className="progress-bar" 
            style={{ width: `${progress}% `}}
          ></div>
        </div>
        
        {/* نقاط تحميل متحركة */}
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