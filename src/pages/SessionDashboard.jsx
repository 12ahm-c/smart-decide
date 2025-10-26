import { Brain, CheckCircle, Clock, FileText, MessageSquare, Send, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import './SessionDashboard.css';

const SessionDashboard = ({ token }) => {
  const { sessionCode } = useParams();
  const [session, setSession] = useState(null);
  const [opinions, setOpinions] = useState([]);
  const [myOpinion, setMyOpinion] = useState('');
  const [myOpinionId, setMyOpinionId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchSession = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/sessions/${sessionCode}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok || res.status === 200) {
        setSession(data.session);

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

        const userOpinion = opinionsWithContent.find(o => o.isMine);
        if (userOpinion) {
          setMyOpinion(userOpinion.opinion);
          setMyOpinionId(userOpinion.id);
        }

        calculateTimeLeft(data.session.expiryDate);
        setIsLoaded(true);
      } else {
        toast.error(data.message || "Error loading session.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server connection error.");
    }
  };

  const calculateTimeLeft = (expiryDate) => {
    const end = new Date(expiryDate).getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft("Session ended");
        clearInterval(interval);
        fetchAiAnalysis();
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);
  };

  const submitOpinion = async () => {
    if (!myOpinion) {
      toast.error("Please enter your opinion.");
      return;
    }

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
        toast.success(data.message + (data.blockchainId ? ` | Blockchain ID: ${data.blockchainId}` : ''), {
          duration: 4000,
        });
        fetchSession();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error submitting opinion.");
    }
  };

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
        toast.success(data.message);
        setMyOpinion('');
        setMyOpinionId(null);
        fetchSession();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting opinion.");
    }
  };

  const fetchAiAnalysis = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/sessions/${sessionCode}/analysis`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setAiAnalysis(data.analysis);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!session) {
    return (
      <div className="session-dashboard">
        <div className="loading-wrapper">
          <Brain size={48} color="#ff6b35" />
          <p className="loading-text">Loading session...</p>
        </div>
      </div>
    );
  }

  const isSessionEnded = timeLeft === "Session ended";

  return (
    <>
      <Toaster position="top-center" />

      <div className={`session-dashboard ${isLoaded ? 'loaded' : ''}`}>
        <div className="dashboard-background">
          <div className="grid-pattern"></div>
          <div className="gradient-overlay"></div>
        </div>

        <div className="floating-elements">
          <div className="floating-element orange-glow"></div>
          <div className="floating-element orange-secondary-glow"></div>
          <div className="floating-element orange-light-glow"></div>
          <div className="floating-element-small"></div>
        </div>

        <div className="content-wrapper">
          <div className="header-card">
            <div className="card-glow"></div>

            <div className="session-badge">
              <MessageSquare size={14} />
              <span>Decision Session</span>
            </div>

            <div className="icon-wrapper">
              <MessageSquare size={32} strokeWidth={2} />
            </div>
            <h1 className="session-title">{session.title}</h1>
            <p className="session-description">{session.description}</p>

            <div className="meta-info">
              <div className="meta-item">
                <Clock size={18} />
                <span>Ends: {new Date(session.expiryDate).toLocaleString()}</span>
              </div>
              <div className={`meta-item time-badge ${isSessionEnded ? 'ended' : 'active'}`}>
                <Clock size={18} />
                <span>{timeLeft}</span>
              </div>
            </div>
          </div>

          {!isSessionEnded && (
            <div className="opinion-card">
              <h3 className="card-title">
                <MessageSquare size={24} />
                Your Opinion
              </h3>
              <textarea
                value={myOpinion}
                onChange={(e) => setMyOpinion(e.target.value)}
                placeholder="Share your thoughts and insights..."
                className="opinion-textarea"
              />
              <div className="button-group">
                <button onClick={submitOpinion} className="btn-primary">
                  <Send size={18} />
                  {myOpinionId ? "Update Opinion" : "Submit Opinion"}
                </button>
                {myOpinionId && (
                  <button onClick={deleteOpinion} className="btn-danger">
                    <Trash2 size={18} />
                    Delete
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="opinions-card">
            <h3 className="card-title">
              <Users size={24} />
              Participants' Opinions ({opinions.length})
            </h3>
            {opinions.length === 0 ? (
              <p className="empty-state">No opinions submitted yet. Be the first!</p>
            ) : (
              <div className="opinions-list">
                {opinions.map((o, idx) => (
                  <div key={idx} className="opinion-item">
                    <div className="opinion-header">
                      <strong className="participant-name">
                        {o.fullName || 'Anonymous'}
                      </strong>
                      {o.fileId && (
                        <div className="verified-badge">
                          <CheckCircle size={16} />
                          <span>Verified</span>
                        </div>
                      )}
                    </div>
                    <p className="opinion-text">{o.opinion}</p>

                    {o.blockchainContent && (
                      <div className="blockchain-content">
                        <FileText size={14} />
                        <em>Hedera Content:</em> {o.blockchainContent}
                      </div>
                    )}

                    {o.fileId && (
                      <a
                        href={`http://localhost:5001/api/file/${o.fileId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="blockchain-link"
                      >
                        View on Blockchain →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {isSessionEnded && aiAnalysis && (
            <div className="ai-analysis-card">
              <div className="ai-header">
                <div className="ai-icon-wrapper">
                  <Brain size={28} />
                </div>
                <h3 className="ai-title">AI Analysis & Recommendation</h3>
              </div>

              <div className="ai-content">
                <p className="ai-summary">{aiAnalysis.summary}</p>

                {aiAnalysis.recommended && (
                  <div className="recommendation-box">
                    <strong>💡 Final Decision:</strong>
                    <p>{aiAnalysis.recommended}</p>
                  </div>
                )}

                {aiAnalysis.blockchainHash && (
                  <div className="blockchain-hash">
                    <CheckCircle size={18} />
                    <span>Blockchain Hash: {aiAnalysis.blockchainHash}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SessionDashboard;
