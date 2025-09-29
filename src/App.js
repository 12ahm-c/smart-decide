import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import Login from './pages/Login';
import Signup from './pages/SignUp';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import DecisionForm from './pages/DecisionForm';
import DecisionOutput from './pages/DecisionOutput';
import Choix from './pages/Choix';
import MemberCodeEntry from './pages/MemberCodeEntry';
import AdminCreateOrg from './pages/AdminCreateOrg';
import AdminDashboard from './pages/AdminDashboard.js';





function App() {
  const [token, setToken] = useState(null); // <-- هنا

  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<Login setToken={setToken} />} />  {/* <-- تمرير setToken */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard token={token} />} />
<Route path="/form/:domainId" element={<DecisionForm token={token} />} />
<Route path="/result/:domainId" element={<DecisionOutput />} />
  <Route path="/choix" element={<Choix />} />
  <Route path="/member-code-entry" element={<MemberCodeEntry token={token} />} />
  <Route path="/admin-create-org" element={<AdminCreateOrg token={token} />} />
    <Route path="/admin-Dashboard" element={<AdminDashboard token={token} />} />


      </Routes>
      
    </Router>
  );
}

export default App;

