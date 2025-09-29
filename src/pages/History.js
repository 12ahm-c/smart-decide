// src/pages/History.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const History = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = location.state || {}; // نأخذ userId من token
  const [decisions, setDecisions] = useState([]);
  const [blockchainContents, setBlockchainContents] = useState({});

  useEffect(() => {
    if (!userId) {
      alert("المستخدم غير محدد!");
      navigate('/dashboard');
      return;
    }

    fetch(`http://localhost:5001/api/decisions/${userId}`)
      .then(res => res.json())
      .then(data => setDecisions(data.decisions || []))
      .catch(err => console.error(err));
  }, [userId, navigate]);

  const verifyOnHedera = async (fileId) => {
    if (!fileId) return;
    try {
      setBlockchainContents(prev => ({ ...prev, [fileId]: 'جارٍ جلب المحتوى...' }));
      const res = await fetch(`http://localhost:5001/api/file/${encodeURIComponent(fileId)}`);
      const j = await res.json();
      setBlockchainContents(prev => ({ ...prev, [fileId]: j.content || JSON.stringify(j) }));
    } catch (err) {
      setBlockchainContents(prev => ({ ...prev, [fileId]: 'خطأ: ' + err.message }));
    }
  };

  return (
    <div className="history-container" style={{ padding: '20px' }}>
      <h1>📜 سجل قراراتي</h1>

      {decisions.length === 0 ? (
        <p>لا توجد قرارات محفوظة بعد.</p>
      ) : (
        decisions.map(d => (
          <div key={d.id} style={{ border: '1px solid #ccc', margin: 10, padding: 10, borderRadius: 6 }}>
            <h2>{d.domain || `Decision #${d.id}`}</h2>

            <div>
              <h3>📋 المدخلات</h3>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{d.input}</pre>
            </div>

            <div>
              <h3>🤖 نتيجة الذكاء الاصطناعي</h3>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{d.aiResult}</pre>
            </div>

            <div>
              <h3>🔏 البلوكشين</h3>
              <p>FileId: <b>{d.fileId}</b></p>
              <button onClick={() => verifyOnHedera(d.fileId)} style={{ marginBottom: '5px' }}>
                عرض المحتوى من Hedera
              </button>
              <pre style={{ whiteSpace: 'pre-wrap', background: '#f9f9f9', padding: '5px' }}>
                {blockchainContents[d.fileId]}
              </pre>
            </div>

            <button
              onClick={() =>
                navigate(`/result/${d.domain}`, {
                  state: {
                    domainName: d.domain,
                    formData: JSON.parse(d.input || '{}'), // تحويل النص إلى كائن
                    aiResult: d.aiResult,
                    blockchainId: d.fileId
                  }
                })
              }
              style={{ marginTop: '10px' }}
            >
              عرض القرار
            </button>
          </div>
        ))
      )}

      <button onClick={() => navigate('/dashboard')} style={{ marginTop: '20px' }}>
        ⬅ العودة للوحة التحكم
      </button>
    </div>
  );
};

export default History;