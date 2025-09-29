// src/pages/DecisionOutput.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './DecisionOutput.css';

const DecisionOutput = () => {
  const location = useLocation();
  const navigate = useNavigate();
const locationState = location.state || {};
const domainName = locationState.domainName || 'Unnamed Decision';
const formData = locationState.formData || {};
const aiResult = locationState.aiResult || 'No AI result available';
const blockchainId = locationState.blockchainId || null;const [blockchainContent, setBlockchainContent] = useState(null);

useEffect(() => {
    if (blockchainId) {
      fetch(`http://localhost:5001/api/file/${encodeURIComponent(blockchainId)}`)
        .then(res => res.json())
        .then(j => {
          if (j.content) setBlockchainContent(j.content);
          else setBlockchainContent('لم يمكن جلب المحتوى من Hedera: ' + JSON.stringify(j));
        }).catch(err => setBlockchainContent('خطأ: ' + err.message));
    }
  }, [blockchainId]);

  if (!domainName || !formData) {
    return <div>No data available to display the decision.</div>;
  }

  return (
    <div className="decision-output-container">
      <h1 className="decision-title">Decision: {domainName}</h1>

      <div className="card">
        <h2>📋 Extracted Details</h2>
        <pre className="form-data">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </div>

<div className="card ai-result">
  <h2>🤖 AI Result</h2>
  {aiResult ? (
    aiResult
      // تقسيم النص إلى فقرات عند كل نقطة أو فاصلة مزدوجة
      .split(/(?:\.\s|\n)/)
      .map((paragraph, index) => paragraph.trim())
      .filter(p => p.length > 0)
      .map((paragraph, index) => (
        <p key={index}>{paragraph}.</p>
      ))
  ) : (
    <p>The analyzed decision will be displayed here after AI integration</p>
  )}
</div>

<div className="card blockchain">
    <h2>🔏 Blockchain Seal</h2>
    {blockchainId ? (
      <>
        <p>FileId: <b>{blockchainId}</b></p>
        <pre style={{whiteSpace:'pre-wrap'}}>{blockchainContent || 'جارٍ جلب المحتوى...'}</pre>
      </>
    ) : (
      <p className="blockchain-placeholder">لم يتم تسجيل القرار على البلوكشين بعد.</p>
    )}
  </div>
        <button className="back-button" onClick={() => navigate('/dashboard')}>
        Back to Dashboard
      </button>
    </div>
  );
};

export default DecisionOutput;