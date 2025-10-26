const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

exports.createSession = (req, res) => {
  const { title, description, durationSeconds, analysisMethod } = req.body;

  if (!title || !durationSeconds || durationSeconds <= 0 || !analysisMethod) {
    return res.status(400).json({ message: 'الحقول المطلوبة ناقصة أو مدة غير صالحة' });
  }

  const sessionCode = uuidv4().split('-')[0];
  const createdAt = new Date();
  const expiryDate = new Date(createdAt.getTime() + Number(durationSeconds) * 1000);

  db.run(
    `INSERT INTO sessions (sessionCode, title, description, analysisMethod, createdBy, createdAt, expiryDate) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [sessionCode, title, description || null, analysisMethod, req.user.id, createdAt.toISOString(), expiryDate.toISOString()],
    function(err) {
      if (err) {
        console.error('Create session DB error:', err);
        return res.status(500).json({ message: err.message });
      }
      res.json({
        sessionCode,
        createdAt: createdAt.toISOString(),
        expiryDate: expiryDate.toISOString()
      });
    }
  );
};

exports.joinSession = (req, res) => {
  const { sessionCode, userEmail } = req.body;

  if (!sessionCode || !userEmail) {
    return res.status(400).json({ message: 'الكود والبريد مطلوبان' });
  }

  db.get('SELECT * FROM sessions WHERE sessionCode = ?', [sessionCode], (err, session) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!session) return res.status(404).json({ message: 'جلسة غير موجودة' });

    if (session.expiryDate && new Date(session.expiryDate) < new Date()) {
      return res.status(403).json({ message: 'انتهت صلاحية الجلسة' });
    }

    db.run(
      'INSERT INTO session_members (sessionId, userEmail, joinedAt) VALUES (?, ?, ?)',
      [session.id, userEmail, new Date().toISOString()],
      function(err) {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: 'تم الانضمام للجلسة' });
      }
    );
  });
};

exports.getSessionByCode = (req, res) => {
  const code = req.params.code;

  db.get('SELECT * FROM sessions WHERE sessionCode = ?', [code], (err, session) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!session) return res.status(404).json({ message: 'جلسة غير موجودة' });
    res.json({ session });
  });
};

exports.joinSessionAuth = (req, res) => {
  const { sessionCode } = req.body;

  if (!sessionCode) {
    return res.status(400).json({ message: "كود الجلسة مطلوب" });
  }

  db.get(`SELECT * FROM sessions WHERE sessionCode = ?`, [sessionCode], (err, session) => {
    if (err) return res.status(500).json({ message: "خطأ في قاعدة البيانات" });
    if (!session) return res.status(404).json({ message: "لم يتم العثور على الجلسة" });

    const now = Date.now();
    if (now > new Date(session.expiryDate).getTime()) {
      return res.status(403).json({ message: "انتهت صلاحية هذه الجلسة ⏰" });
    }

    res.json({
      message: "تم الانضمام بنجاح ✅",
      session,
    });
  });
};

// Get all sessions for authenticated user
exports.getUserSessions = (req, res) => {
  const userId = req.user.id;

  db.all(
    `SELECT
      s.id,
      s.sessionCode,
      s.title,
      s.description,
      s.analysisMethod,
      s.createdAt,
      s.expiryDate,
      CASE
        WHEN datetime(s.expiryDate) > datetime('now') THEN 'Active'
        ELSE 'Completed'
      END as status,
      COUNT(DISTINCT sm.userEmail) as participants,
      CASE
        WHEN datetime(s.expiryDate) > datetime('now')
        THEN CAST((julianday('now') - julianday(s.createdAt)) * 100.0 /
             (julianday(s.expiryDate) - julianday(s.createdAt)) as INTEGER)
        ELSE 100
      END as progress
    FROM sessions s
    LEFT JOIN session_members sm ON s.id = sm.sessionId
    WHERE s.createdBy = ?
    GROUP BY s.id
    ORDER BY s.createdAt DESC`,
    [userId],
    (err, sessions) => {
      if (err) {
        console.error('Get sessions error:', err);
        return res.status(500).json({ message: err.message });
      }

      res.json({
        sessions: sessions || []
      });
    }
  );
};
