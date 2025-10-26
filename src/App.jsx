import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import Login from './pages/Login';
import Signup from './pages/SignUp';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CreateSession from './pages/CreateSession';
import JoinSession from './pages/JoinSession';
import SessionDashboard from './pages/SessionDashboard'
function App() {
  const [token, setToken] = useState(null); // <-- هنا

  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<Login setToken={setToken} />} />  {/* <-- تمرير setToken */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
<Route 
  path="/dashboard" 
  element={<Dashboard token={token} setToken={setToken} />} 
/>
<Route path="/create-session" element={<CreateSession token={token} />} />
<Route path="/join-session" element={<JoinSession token={token} />} />
<Route path="/session/:sessionCode" element={<SessionDashboard token={token} />} />
      </Routes>
    </Router>
  );
}

export default App;