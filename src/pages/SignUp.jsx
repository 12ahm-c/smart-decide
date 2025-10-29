import {
  ArrowLeft,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Lock,
  Mail,
  Sparkles,
  User,
  X
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import './SignUp.css';

const Signup = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
    setAvatarPreview(null);
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append('fullName', formData.fullName);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('password', formData.password);
    if (avatar) formDataToSend.append('avatar', avatar);

    try {
      const response = await fetch('http://localhost:5001/api/signup', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      alert('Account created successfully! 🎉');

      // التوجيه إلى صفحة تسجيل الدخول مباشرة
      navigate('/login'); 
    } catch (error) {
      console.error(error);
      alert('Network error or server is down.');
    } finally {
      setIsLoading(false);
    }
  };  return (
    <div className="signup-container">
      <div className="signup-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
      </div>

      <Link to="/" className="back-button">
        <ArrowLeft size={18} />
        <span>Back to Home</span>
      </Link>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="logo-container">
          <div className="logo-ring"></div>
          <div className="logo">
            <img src={logo} alt="SmartDecide Logo" className="logo-img" />
          </div>
        </div>

        <div className="badge">
          <Sparkles size={14} />
          <span>Join Smart Decide</span>
        </div>

        <h2>Create Your Account</h2>
        <p>Start your journey towards smarter decisions today.</p>

        {error && <div className="alert error-alert">{error}</div>}
        {success && <div className="alert success-alert">{success}</div>}

        <div className="form-container">
          <div className="avatar-section">
            {avatarPreview ? (
              <div className="avatar-preview-container">
                <img src={avatarPreview} alt="Avatar preview" className="avatar-preview" />
                <button type="button" onClick={removeAvatar} className="remove-avatar-button">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="upload-area">
                <input type="file" accept="image/*" onChange={handleFileChange} />
                <div className="upload-content">
                  <div className="upload-icon">
                    <ImageIcon size={24} />
                  </div>
                  <div className="upload-text">
                    <span>Upload profile picture</span>
                    <small>PNG, JPG up to 5MB</small>
                  </div>
                </div>
              </label>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="fullName">Full Name</label>
            <div className={`input-wrapper ${focusedField === 'fullName' ? 'focused' : ''}`}>
              <User size={20} className="input-icon" />
              <input
                id="fullName"
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                onFocus={() => setFocusedField('fullName')}
                onBlur={() => setFocusedField(null)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <div className={`input-wrapper ${focusedField === 'email' ? 'focused' : ''}`}>
              <Mail size={20} className="input-icon" />
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className={`input-wrapper ${focusedField === 'password' ? 'focused' : ''}`}>
              <Lock size={20} className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="eye-button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <small className="password-hint">Minimum 6 characters</small>
          </div>

          <button type="submit" disabled={isLoading} className="submit-button">
            {isLoading ? (
              <>
                <div className="spinner"></div>
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <span className="button-arrow">→</span>
              </>
            )}
          </button>
        </div>

        <div className="divider">
          <span>or</span>
        </div>

        <div className="login-prompt">
          <span>Already have an account? </span>
          <Link to="/login">Login</Link>
        </div>
      </form>
    </div>
  );
};

export default Signup;
