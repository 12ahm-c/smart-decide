// SessionDashboard.js
// This page displays a session details, allows submitting/modifying/deleting opinions,
// shows all participants' opinions, and finally AI analysis & blockchain verification.

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './SessionDashboard.css';

const SessionDashboard = ({ token }) => {
  const { sessionCode } = useParams();
  const [session, setSession] = useState(null);
  const [opinions, setOpinions] = useState([]);
  const [myOpinion, setMyOpinion] = useState('');
  const [myOpinionId, setMyOpinionId] = useState(null);
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  // ===== Fetch session data and opinions =====
  const fetchSession = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/sessions/${sessionCode}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok || res.status === 200) {
        setSession(data.session);

        // Fetch blockchain content for each opinion
        const opinionsWithContent = await Promise.all(
          (data.opinions || []).map(async (o) => {
            if (o.fileId) {
              try {
                const fileData = await fetch(`http://localhost:5001/api/file/${o.fileId}`).then(r => r.json());
                o.blockchainContent = fileData.content;
              } catch (err) {
                console.warn("Failed to fetch Hedera content:", err);
              }
            }
            return o;
          })
        );

        setOpinions(opinionsWithContent);

        // Set user's current opinion if exists
        const userOpinion = opinionsWithContent.find(o => o.isMine);
        if (userOpinion) {
          setMyOpinion(userOpinion.opinion);
          setMyOpinionId(userOpinion.id);
        }

        calculateTimeLeft(data.session.expiryDate);
      } else {
        setMessage(data.message || "Error loading session.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server connection error.");
    }
  };

  // ===== Calculate remaining time =====
  const calculateTimeLeft = (expiryDate) => {
    const end = new Date(expiryDate).getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft("Session ended");
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);
  };

  // ===== Submit or update opinion =====
  const submitOpinion = async () => {
    if (!myOpinion) return alert("Please enter your opinion.");

    try {
      const url = myOpinionId
        ? `http://localhost:5001/api/sessions/${sessionCode}/opinion/${myOpinionId}`
        : `http://localhost:5001/api/sessions/${sessionCode}/opinion`;
      const method = myOpinionId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ opinion: myOpinion })
      });

      const data = await res.json();
      if (res.ok || res.status === 200) {
        setMessage(data.message + (data.blockchainId ? ` | Blockchain ID: ${data.blockchainId}` : ''));
        fetchSession(); // refresh opinions
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      console.error(err);
      setMessage("Error submitting opinion.");
    }
  };

  // ===== Delete opinion =====
  const deleteOpinion = async () => {
    if (!myOpinionId) return;
    if (!window.confirm("Are you sure you want to delete your opinion?")) return;

    try {
      const res = await fetch(`http://localhost:5001/api/sessions/${sessionCode}/opinion/${myOpinionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok || res.status === 200) {
        setMessage(data.message);
        setMyOpinion('');
        setMyOpinionId(null);
        fetchSession();
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      console.error(err);
      setMessage("Error deleting opinion.");
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  if (!session) return <p>Loading session...</p>;

  return (
    <div className="session-dashboard">
      <h2>{session.title}</h2>
      <p>{session.description}</p>
      <p>Ends at: {new Date(session.expiryDate).toLocaleString()}</p>
      <p>⏱ Time left: {timeLeft}</p>

      {timeLeft !== "Session ended" && (
        <div className="opinion-input">
          <textarea
            value={myOpinion}
            onChange={(e) => setMyOpinion(e.target.value)}
            placeholder="Enter your opinion here"
          />
          <button onClick={submitOpinion}>{myOpinionId ? "Update Opinion" : "Submit Opinion"}</button>
          {myOpinionId && <button onClick={deleteOpinion}>Delete Opinion</button>}
        </div>
      )}

      {message && <p className="message">{message}</p>}

      <h3>Participants' Opinions:</h3>
      <ul>
        {opinions.map((o, idx) => (
          <li key={idx}>
            <strong>{o.fullName || 'Anonymous'}:</strong> {o.opinion}
            {o.blockchainContent && (
              <div className="blockchain-content">
                <em>Hedera Content:</em> {o.blockchainContent}
              </div>
            )}
            {o.fileId && (
              <span>
                {" "}✅ <a href={`http://localhost:5001/api/file/${o.fileId}`} target="_blank" rel="noreferrer">{o.fileId}</a>
              </span>
            )}
          </li>
        ))}
      </ul>

      {timeLeft === "Session ended" && aiAnalysis && (
        <div className="ai-analysis">
          <h3>🔍 AI Analysis:</h3>
          <p>{aiAnalysis.summary}</p>
          {aiAnalysis.recommended && <p>💡 Final Decision: {aiAnalysis.recommended}</p>}
          {aiAnalysis.blockchainHash && (
            <p>✅ Blockchain Hash: {aiAnalysis.blockchainHash}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SessionDashboard;