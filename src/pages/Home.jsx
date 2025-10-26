import { BarChart3, Brain, CheckCircle, ChevronRight, GitBranch, Globe, Layers, Lock, MessageSquare, Shield, Sparkles, Target, TrendingUp, UserCheck, Users, Vote, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import './Home.css';

const Home = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const problems = [
    { number: "01", title: "Lack of Transparency", description: "It's often unclear how or why final decisions are made, leading to distrust.", icon: <UserCheck size={40} /> },
    { number: "02", title: "Low Engagement", description: "Participants feel their input has little impact, reducing involvement.", icon: <MessageSquare size={40} /> },
    { number: "03", title: "No Accountability", description: "There's no trusted record to verify the process, making it difficult to hold anyone accountable.", icon: <GitBranch size={40} /> }
  ];

  const solutions = [
    { icon: <Lock size={32} />, title: "Secure & Interactive Platform", description: "A state-of-the-art, secure platform for collective decision-making." },
    { icon: <Brain size={32} />, title: "AI-Powered Analysis", description: "Leverages advanced AI to analyze opinions and generate clear, unbiased summaries." },
    { icon: <Layers size={32} />, title: "Hedera Blockchain", description: "Stores all results on the Hedera blockchain for immutable transparency and trust." }
  ];

  const objectives = [
    { icon: <Users size={28} />, title: "Transparent & Inclusive Decisions", description: "Facilitate group decisions in a way that is transparent, fair, and accessible to everyone." },
    { icon: <MessageSquare size={28} />, title: "Collaborative Discussion Spaces", description: "Allow users to create or join interactive discussion sessions on any topic of interest." },
    { icon: <Sparkles size={28} />, title: "AI-Powered Insights", description: "Use AI to analyze diverse opinions and generate clear, unbiased decision summaries." },
    { icon: <Shield size={28} />, title: "Trust Through Blockchain", description: "Ensure data integrity, transparency, and secure authentication for all participants." }
  ];

  return (
    <div className="smart-decide-app">
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="logo-section">
            <img src={logo} alt="SmartDecide Logo" className="logo-icon" />
            <span className="logo-text">Smart Decide</span>
            <span className="hedera-badge"><Zap size={14} />Hedera Powered</span>
          </div>
          <div className="nav-links desktop-nav">
            <a href="#problem" className="nav-link">Problem</a>
            <a href="#solution" className="nav-link">Solution</a>
            <a href="#objectives" className="nav-link">Objectives</a>
            <a href="#business" className="nav-link">Business Model</a>
            <Link to="/login" className="login-btn">Sign In</Link>
            <Link to="/signup" className="signup-btn">
              Get Started<ChevronRight size={18} />
            </Link>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="mobile-menu-btn">
            <div className={`hamburger ${mobileMenuOpen ? 'open-1' : ''}`}></div>
            <div className={`hamburger ${mobileMenuOpen ? 'open-2' : ''}`}></div>
            <div className={`hamburger ${mobileMenuOpen ? 'open-3' : ''}`}></div>
          </button>
        </div>
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <a href="#problem" onClick={() => setMobileMenuOpen(false)}>Problem</a>
          <a href="#solution" onClick={() => setMobileMenuOpen(false)}>Solution</a>
          <a href="#objectives" onClick={() => setMobileMenuOpen(false)}>Objectives</a>
          <a href="#business" onClick={() => setMobileMenuOpen(false)}>Business Model</a>
          <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
          <Link to="/signup" className="mobile-signup" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
        </div>
      </nav>

      <div className="hero">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="hero-text">
            <div className="badge"><Sparkles size={16} /><span>AI-Powered Decision Intelligence</span></div>
            <h1 className="hero-title">Make Smarter<br /><span className="gradient-text">Decisions Together</span></h1>
            <p className="hero-description">Transform group decision-making with <strong>AI-powered insights</strong> and <strong>blockchain-verified transparency</strong>. Secure, fair, and efficient collaboration for teams of any size.</p>
            <div className="hero-cta">
              <Link to="/signup" className="primary-btn">Start Free Trial<ChevronRight size={20} /></Link>
              <a href="#solution" className="secondary-btn">See How It Works</a>
            </div>
            <div className="trust-indicators">
              <div className="trust-item"><CheckCircle size={18} /><span>Blockchain Verified</span></div>
              <div className="trust-item"><CheckCircle size={18} /><span>AI-Powered</span></div>
              <div className="trust-item"><CheckCircle size={18} /><span>100% Transparent</span></div>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-image-card">
              <div className="hero-feature"><Vote size={48} strokeWidth={1.5} /><span>Democratic Voting</span></div>
              <div className="hero-feature"><Brain size={48} strokeWidth={1.5} /><span>AI Analysis</span></div>
              <div className="hero-feature"><Shield size={48} strokeWidth={1.5} /><span>Blockchain Security</span></div>
              <div className="hero-feature"><Users size={48} strokeWidth={1.5} /><span>Team Collaboration</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="problem-section section" id="problem">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">The Problem</h2>
            <p className="section-subtitle">Traditional decision-making is broken. It's time for a change.</p>
          </div>
          <div className="problems-grid">
            {problems.map((p, i) => (
              <div key={i} className="problem-card">
                <div className="problem-card-inner">
                  <div className="problem-icon">{p.icon}</div>
                  <div className="problem-number">{p.number}</div>
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="solution-section section" id="solution">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Our Solution</h2>
            <p className="section-subtitle">Advanced technology for better outcomes.</p>
          </div>
          <div className="solutions-grid">
            {solutions.map((s, i) => (
              <div key={i} className="solution-card">
                <div className="solution-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="objectives-section section" id="objectives">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Our Mission</h2>
            <p className="section-subtitle">What drives Smart Decide forward.</p>
          </div>
          <div className="objectives-grid">
            {objectives.map((o, i) => (
              <div key={i} className="objective-card">
                <div className="objective-icon">{o.icon}</div>
                <h3>{o.title}</h3>
                <p>{o.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="business-section section" id="business">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Business Model</h2>
            <p className="section-subtitle">Built for sustainable growth and impact.</p>
          </div>
          <div className="business-grid">
            <div className="business-card">
              <div className="business-header"><Users size={28} /><h3>Key Partners</h3></div>
              <ul><li>Municipalities and local authorities</li><li>Companies and organizations</li><li>Blockchain developers</li><li>Cloud service providers</li></ul>
            </div>
            <div className="business-card">
              <div className="business-header"><Target size={28} /><h3>Key Activities</h3></div>
              <ul><li>App development & maintenance</li><li>Web & mobile UX/UI design</li><li>Real-time analysis & data analysis</li><li>Blockchain security</li><li>Marketing & user awareness campaigns</li></ul>
            </div>
            <div className="business-card">
              <div className="business-header"><Sparkles size={28} /><h3>Value Proposition</h3></div>
              <ul><li>Transparent & reliable decision-making</li><li>Fair and significant engagement</li><li>Real-time vote tracking & visualization</li><li>Reduced conflicts & errors in decisions</li></ul>
            </div>
            <div className="business-card">
              <div className="business-header"><Globe size={28} /><h3>Customer Segments</h3></div>
              <ul><li>Local governments (cities, municipalities)</li><li>Private companies</li><li>Associations & NGOs</li><li>Online communities & collaborative groups</li></ul>
            </div>
            <div className="business-card">
              <div className="business-header"><BarChart3 size={28} /><h3>Cost Structure</h3></div>
              <ul><li>Software development & updates</li><li>Cloud infrastructure & blockchain security</li><li>Marketing campaigns</li><li>Technical support & training</li></ul>
            </div>
            <div className="business-card">
              <div className="business-header"><TrendingUp size={28} /><h3>Revenue Streams</h3></div>
              <ul><li>Subscriptions (monthly/annual)</li><li>Premium services (analytics, reports)</li><li>Commission on participation</li><li>Partnerships & grants</li></ul>
            </div>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Ready to Transform Decision-Making?</h2>
        <p>Join leading organizations using Smart Decide for transparent, fair, and efficient collaboration.</p>
        <Link to="/signup" className="primary-btn">
          Start Free Trial<ChevronRight size={20} />
        </Link>
      </div>

      <footer>
        <div className="footer-content">
          <div className="footer-logo">
            <img src={logo} alt="SmartDecide Logo" className="footer-logo-img" />
            <span>Smart Decide</span>
          </div>
          <p>© 2025 Smart Decide. Built for the Hedera Hackathon.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
