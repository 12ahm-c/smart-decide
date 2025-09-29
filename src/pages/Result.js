import React from 'react';
import { useParams, Link } from 'react-router-dom';

const Result = () => {
  const { decisionId } = useParams();

  return (
    <div style={{ padding: '20px' }}>
      <h1>القرار النهائي لمجال: {decisionId}</h1>
      <p>هنا ستعرض نتائج التحليل والتوصية من الـ AI.</p>
      <Link to="/">العودة للصفحة الرئيسية</Link>
    </div>
  );
};

export default Result;